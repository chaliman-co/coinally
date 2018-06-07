const
    router = new require("express").Router();
serverUtils = require("../../lib/utils"),
    path = require("path"),
    {
        User
    } = require(path.join(serverUtils.getRootDirectory() + "/lib/db"));

module.exports = router;

router
    .get("/", handleGetAuth)
    .post("/", handlePostAuth)

function handleGetAuth(req, res, next) {
    const {
        code
    } = req.query;
    if (!code) return res._sendError("missing or invalid parameters", new serverUtils.ErrorReport(400, {
        code: "code not provided"
    }))
    User.findOne({
            "verificationCode.value": code
        }).exec().then(function foundUser(user) {
            if (!user) return res._sendError("item not found", new serverUtils.ErrorReport(404, {
                code: "code not found"
            }));
            if (user.verificationCode.expiresIn < Date.now()) return res._sendError("item expired", new serverUtils.ErrorReport({
                code: "code expired"
            }));
            if (!user.isVerified) {
                user.isVerified = true;
                return user.save().then(function savedUser(user) {
                    console.log("done justice\n")
                    return res._success({
                        token: serverUtils.getAuthToken(user)
                    })
                }, function failedToSave(err) {
                    return next(err)
                })
            }
            console.log("the other side\n")
            return res._success({
                token: serverUtils.getAuthToken(user)
            })

        }),
        function failedToFind(err) {
            return next(err)
        }
}

function handlePostAuth(req, res, next) {
    if (!(req.body && req.body.hasOwnProperty("emailAddress")))
        return res._sendError("missing or invalid parameters", new serverUtils.ErrorReport(400, {
            emailAddress: "emailAddress not provided"
        }))
    ;
    const { emailAddress } = req.body;
    User.findOne({emailAddress}).exec().then(function onFind(user) {
        if (!user) return res._sendError("item not found", new serverUtils.ErrorReport(404, {
            emailAddress: "user not found"
        }));
        const verificationCode = serverUtils.genVerificationCode();
        user.verificationCode = verificationCode;
        console.log(user.verificationCode, verificationCode)
        user.save().then(function savedUser(user) {
            serverUtils.sendAuthCode(user, function sentCode(err) {
                if (err) {console.log(err); return next(new serverUtils.ServerError(err))}; console.log('sent code')
                return res._success()
            })
        }, function failedToSave(err) {
            next(err)
        })
    }, function handleError() {
        next(err)
    })
}