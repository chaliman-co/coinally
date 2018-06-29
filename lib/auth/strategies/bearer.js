const
    passport = require('passport'),
    BearerStrategy = require('passport-http-bearer'),
    jwt = require('jsonwebtoken'),
    bcrypt = require('bcrypt'),
    {
        User,
    } = require('../../db'),
    serverConfig = require('./../../config.json');

bearerStrategy = new BearerStrategy(((token, done) => {
    try {
        var tokenDetails = jwt.decode(token);
    } catch (err) {
        return done({
            token: 'invalid token',
        });
    }
    if (!(tokenDetails && tokenDetails.emailAddress)) {
        return done({
            token: 'invalid token',
        });
    }
    User.findOne({
            emailAddress: tokenDetails.emailAddress,
        }).exec().then((user) => {
            if (!user) {
                return done({
                    token: 'unrecognized token',
                });
            }
            jwt.verify(token, String(serverConfig.TOKEN_SECRET), {
                maxAge: serverConfig.TOKEN_VALIDITY,
            }, (err, tokenDetails) => {
                if (err) {
                    return done({
                        token: err.message,
                    });
                }
                return done(null, user);
            });
        })
        .catch(err => done(err));
}));

passport.use('jwt', bearerStrategy);
module.exports = bearerStrategy;
