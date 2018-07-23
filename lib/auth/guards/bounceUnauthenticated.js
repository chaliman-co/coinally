const passport = require('passport');
const serverUtils = require('../../utils');

module.exports = function bounceUnauthenticated(req, res, next) {
    if (!(req.headers.authorization) || (req.headers.authorization.substring(0, 6).toLowerCase() !== 'bearer')) {
        res.header('WWW-Authenticate', 'Bearer')._sendError('authentication failed', new serverUtils.ErrorReport(401, {
            token: 'token not provided',
        }));
    } else {
        passport.authenticate('jwt', {
            session: false,
        }, (err, user, info) => {
            req.user = user;
            if (err) {
                if (err.token) {
                    res.header('WWW-Authenticate', 'Bearer')._sendError('authentication failed', new serverUtils.ErrorReport(401, err));
                } else {
                    next(serverUtils.ServerError(err));
                }
            } else if (!user) {
                res
                    .header('WWW-Authenticate', 'Bearer')
                    ._sendError('authentication failed', new serverUtils.ErrorReport(401, info));
            }
            next();
        })(req, res, next);
    }
};