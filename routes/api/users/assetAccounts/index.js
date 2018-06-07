const
    router = require("express").Router({ mergeParams: true }),
    path = require("path"),
    serverUtils = require("../../../../lib/utils"),
    { Approval, User } = require(path.join(serverUtils.getRootDirectory(), "lib/db"))
;
module.exports = router;

router
    .post("/", handlePostAssetAccount)
    .param("index", resolveIndex)
    .delete("/:index", handleDeleteAssetAccount)
    .post("/:index/is_Verified", handlePutAssetAccountIsVerified)
;

function resolveIndex(req, res, next, index) {
    const { user } = req._params;
    assetAccount = user.assetAccounts[index];
    if (!assetAccount) return res._sendError("item not found", serverUtils.ErrorReport(404, { index: "index not found" }));
    req._params.assetAccount = assetAccount;
    return next()
}

function handlePostAssetAccount(req, res, next) {
    const
        rawInput = req.body,
        details = new User.assetAccounts.Fields(),
        {user} = req._params
    ;
    try {
        serverUtils.deepAssign(details, rawInput);
    } catch (err) {
        let unknownField = err.message.match(/property (.+),/)[1];
        return res._sendError("unknown field", new serverUtils.ErrorReport(400, { [unknownField]: `${unknownField} not recognized` }))
    }
    let assetAccountIndex = user.assetAccounts.push(details);
    user.save().then(function updatedUser(user) {
        let
            approvalDetails = new Approval.Fields();
            serverUtils.deepAssign(approvalDetails, {
            userId: user._id,
            userProperty: `assetAccounts[${assetAccountIndex}]`
        })
        let approval = new Approval(approvalDetails);
        approval.save().then(function savedApproval(approval) {
            return res._success(user.assetAccounts[assetAccountIndex])
        }, function failedToSave(err) {
            next(err)
        })
    }, function failedToUpdate(err) {
        return next(err)
    })
}

function handlePutAssetAccountIsVerified(req, res, next) {
    if (! (req.body && req.body.hasOwnProperty("isVerified"))) return res._sendError("missing or invalid parameters", { isVerified: "isVerified not provided" });
    const
        { isVerified } = req.body,
        { index } = req.params,
        { user } = req._params,
        { assetAccount } = req._params
    ;
    assetAccount.isVerified = isVerified;
    user.save().then(function updatedUser(user) {
        Approval.findOneAndUpdate({userId: user._id, userProperty: `AssetAccounts[${index}]`}, {status: isVerified? "granted" : "denied"}).then(function updatedApproval(approval) {
            return res._success(assetAccount.isVerified)
        }, function failedToUpdate(err) {
            return next(err)
        })
    }, function failedToUpdate(err) {
        return next(err)
    })
}

function handleDeleteAssetAccount(req, res, next) {
    const
        { index } = req.params,
        { user } = req._params
        assetAccount = req._params
    ;
    delete user.assetAccounts[index]
    user.save().then(function updatedUser(user) {
        if (!assetAccount.isVerified) {
            return Approval.findOneAndUpdate({ userId: user._id, userProperty: `AssetAccounts[${index}]` }, { status: "aborted" }).then(function updatedApproval(approval) {
                return res._success(assetAccount)
            }, function failedToUpdate(err) {
                return next(err)
            })
        }
        return res._success(assetAccount)
    }, function failedToUpdate(err) {
        return next(err)
    })
}
