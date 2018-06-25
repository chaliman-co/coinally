const
    passport = require("passport"),
    BearerStrategy = require("passport-http-bearer"),
    jwt = require("jsonwebtoken"),
    bcrypt = require("bcrypt"),
    { User } = require("../../db"),
    serverConfig = require('./../../config.json')
;

module.exports = new BearerStrategy(function getBearer(token, done){
        try{
            var tokenDetails = jwt.decode(token);
        }catch(err){
            return done({token: "invalid jwt"})
        }
        if( !(tokenDetails && tokenDetails.emailAddress) )
            return done({token: "invalid jwt"});
        User.findOne({emailAddress: tokenDetails.emailAddress}).exec().then( user => {
            if(!user) return done({token: "unrecognized token"});
            jwt.verify(token, String(user._id), { maxAge: serverConfig['TOKEN_VALIDITY']}, function returnUser(err, tokenDetails){
                if(err){
                    return done({token: err.message})
                }
                return done(null, user)
            })
        })
        .catch(err => done(err))
    })
;

