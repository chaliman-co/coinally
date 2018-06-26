const
    strategies = require("./auth/strategies"),
    bounceUnauthenticated = require("./guards/bounceUnauthenticated"),
    bounceNonAdmin = require("./guards/bounceNonAdmin"),
    bounceUnauthorised = require('./guards/bounceUnauthorised')
;

module.exports = {
    strategies,
    bounceUnauthenticated,
    bounceNonAdmin,
    bounceUnauthorised
    }
