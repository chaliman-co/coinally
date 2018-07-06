const
    router = require("express").Router({ mergeParams: true }),
    path = require("path"),
    serverUtils = require("../../../../lib/utils"),
    auth =  require(path.join(serverUtils.getRootDirectory(), 'lib/auth')),
    { User } = require(path.join(serverUtils.getRootDirectory(), "lib/db"))
;
module.exports = router;

router
    .put("/", auth.bounceUnauthorised({ admin: true }), handlePutStatus)
;

function handlePutStatus(req, res, next) {
    if (! (req.body && req.body.hasOwnProperty("status")) ) return res._sendError("missing or invalid parameters", new serverUtils.ErrorReport(400, {status: "status not provided"}))
    const
        [status, user] =[req.body && req.body.status, req._params.user],
        params = {status, user},
        errorDetails = {}
    ;
    for (param in params) {
        if (!params[param]) errorDetails[param] = `${param} not provided`;
        else params[param] = String(params[param])
    }
    if (Object.keys(errorDetails).length) return res._sendError("invalid or missing parameters", new serverUtils.ErrorReport(400, errorDetails));
    user.status = status;
    user.save().then(function updatedUser(user) {
        return res._success(status)
    }, function failedToUPdate(err) {
        return next(err);
    })

}
