const serverUtils = require('./../../utils');

module.exports = function bounceNonAdmin(req, res, next) {
    if (req.user.role !== 'admin') {
        return res._sendError(
            'authentication failed',
            new serverUtils.ErrorReport(401, {
                auth: 'user not authorized',
            }),
        );
    }
    next();
};