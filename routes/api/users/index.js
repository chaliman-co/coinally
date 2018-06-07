const
    multer = require("multer"),
    router = require("express").Router({mergeParams: true}),
    path = require("path"),
    serverUtils = require("../../../lib/utils"),
    { User } = require(path.join(serverUtils.getRootDirectory(), "lib/db")),
    { handleGetUsers } = require("./get"),
    { handleGetUser } = require("./get"),
    { handlePostUser } = require("./post"),
    assetAccountsRoute = require("./assetAccounts"),
    verificationDetailsRoute = require("./verificationDetails"),
    imageRoute = require("./image"),
    statusRoute = require("./status"),
    imageStoragePath = path.join(serverUtils.getPublicDirectory(), "images/profile_pictures")
;

module.exports = router;

router
    .post("/", multer({ dest: imageStoragePath }).any(), handlePostUser)
    .get("/", handleGetUsers)

    .param("_id", provideUser)

    .get("/:_id", handleGetUser)
    .use("/:_id/asset_accounts", assetAccountsRoute)
    .use("/:_id/verification_details", verificationDetailsRoute)
    .use("/:_id/image", imageRoute)
    .use("/:_id/status", statusRoute)
;

function provideUser(req, res, next, _id) {
    User.findOne({ _id }).populate("assetAccounts.asset").then(function foundUser(user) {
        if (!user) return res._sendError("item not found", new serverUtils.ErrorReport(404, {_id: "_id not found"}));
        req._params = req._params || {};
        req._params.user = user;
        return next()
    }, function failedToFind(err) {
        return next(err)
    })
}