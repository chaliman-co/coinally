const
    multer = require("multer"),
    router = require("express").Router({ mergeParams: true }),
    path = require("path"),
    serverUtils = require("../../../../lib/utils"),
    { User, Approval } = require(path.join(serverUtils.getRootDirectory(), "lib/db")),
    verificationDetailsStoragePath = path.join(serverUtils.getPublicDirectory(), "images/verification_details")
;

module.exports = router;

router
    .post("/", multer({dest: verificationDetailsStoragePath}).single("image"), handlePostVerificationDetail)
    .param("index", resolveIndex)
    .post("/:index/is_approved", handlePutVerificationDetailIsApproved)
    .delete("/:index", handleDeleteVerificationDetail)
;

function resolveIndex(req, res, next, index) {
    const { user } = req._params; 
    verificationDetail = user.verificationDetails[index];
    if (!verificationDetail) return res._sendError("item not found", new serverUtils.ErrorReport(404, {index: "index not found"}));
    req._params.verificationDetail = verificationDetail;
    return next() 
}

function handlePostVerificationDetail(req, res, next) {
    let 
        user = req._params.user,
        rawInput = req.body,
        details = new User.verificationDetails.Fields()
    ;
    try {
        serverUtils.deepAssign(details, rawInput);
    } catch (err) {
        let unknownField = err.message.match(/property (.+),/)[1];
        return res._sendError("unknown field", serverUtils.ErrorReport(400, { unknownField: `${field} not recognized` }))
    }
    if (req.file) details.imagePath = path.join("images/verification_details", req.file.filename);
    verificationDetailIndex = user.verificationDetails.push(details)-1;
    user.save().then( function updatedUser(user) {
        let approvalDetails = new Approval.Fields();
        serverUtils.deepAssign(approvalDetails, {
            user: user._id.toString(),
            userProperty: `verificationDetails[${verificationDetailIndex}]`
        })
        let approval = new Approval(approvalDetails);
        approval.save().then(function savedApproval(approval) {
            return res._success(user.verificationDetails[verificationDetailIndex])
        }, function failedToSave(err) {
            next(err)
        })
    }, function failedToUpdate(err) {
        return next(err)
    })
}

function handlePutVerificationDetailIsApproved(req, res, next) {
    if (! (req.body && req.body.hasOwnProperty("isApproved")) ) return res._sendError("missing or invalid parameters", new serverUtils.ErrorReport(400, {isApproved: "isApproved not provided"}));
    const 
        { isApproved } = req.body,
        { index } = req.params,
        { user } = req._params,
        { verificationDetail } = req._params
    ;

    verificationDetail.isApproved = isApproved;
    user.save().then(function updatedUser(user) {
        Approval.findOneAndUpdate({ userId: user._id, userProperty: `verificationDetails[${index}]` }, { status: isApproved? "granted" : "denied" }).then(function updatedApproval(approval) {
            return res._success(verificationDetail.isApproved)
        }, function failedToUpdate(err) {
            return next(err)
        })
    }, function failedToUpdate(err) {
        return next(err)
    })
}

function handleDeleteVerificationDetail(req, res, next) {
    const
        { verificationDetail } = req._params,
        { user } = req._params,
        index = Number(req.params.index)
    ;
    user.verificationDetails.splice(index, 1, null);
    user.save().then(function updatedUser(user) {
        if (!verificationDetail.isApproved) {
            return Approval.findOneAndUpdate({ user: user._id, userProperty: `verificationDetails[${index}]` }, { status: "aborted" }).then(function updatedApproval(approval) {
                console.log("rem: ", approval, "\n user verifi ", user.verificationDetails[index]);
                return res._success(verificationDetail)
            }, function failedToUpdate(err) {
                return next(err)
            })
        }
        return res._success(verificationDetail)
    }, function failedToUpdate(err) {
        return next(err)
    })
}