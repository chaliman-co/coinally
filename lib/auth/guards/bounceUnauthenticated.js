const
    passport = require('passport'),
    serverUtils = require('../../utils');

module.exports = function bounceUnauthenticated(req, res, next) {
    if (!(req.headers.authorization) || !(req.headers.authorization.substring(0, 6) === 'Bearer')) return res.header('WWW-Authenticate', 'Bearer')._sendError('authentication failed', serverUtils.ErrorReport(401, { token: 'jwt not provided' }));
    passport.authenticate('jwt', { session: false }, (err, user, info) => {
        if (err) {
            if (err.token) return res.header('WWW-Authenticate', 'Bearer')._sendError('authentication failed', serverUtils.ErrorReport(401, err));
            return next(serverUtils.ServerError(err));
        }
        if (!user) return res.header('WWW-Authenticate', 'Bearer')._sendError('authentication failed', serverUtils.ErrorReport(401, info));
        next();
    })(req, res, next);
};