const
    strategies = require("./auth/strategies"),
    bounceUnauthorized = require("./auth/bounce_unauthorized"),
    bounceNonAdmin = require("./auth/bounce_non_admin"),
    { TOKEN_SECRET } = require("./config")
;

module.exports = {
    bounceNonAdmin,
    strategies,
    bounceUnauthorized,
    TOKEN_SECRET
    }