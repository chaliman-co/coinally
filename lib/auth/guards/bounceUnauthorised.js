const serverUtils = require('./../../utils');
module.exports = canBe => {
    return function bounceUnauthorised(req, res, next) {
        let isAllowed = false;
        if (canBe.owner) {
            if (req.user._id == req.params._id) isAllowed = true;
        }
        if (canBe.admin) {
            if (req.user.role == 'admin') isAllowed = true;
        }
        if (!isAllowed) return res._sendError('authentication failed', new serverUtils.ErrorReport(401, {
            auth: "user not authorized",
        }));
        return next()
    }
}
