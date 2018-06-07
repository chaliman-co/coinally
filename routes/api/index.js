const
    router = require("express").Router(),
    serverUtils = require('../../lib/utils'),
    transactionsRoute = require("./transactions"),
    usersRoute = require("./users"),
    authRoute = require("./auth"),
    assetsRoute = require("./assets"),
    configRoute = require("./config"),
    conversionRoute = require("./conversion")
;

module.exports = router;

router
    .get('/', function (req, res, next) {
        return res._success();
    })
    .use("/users", usersRoute)
    .use("/auth", authRoute)
    .use("/assets", assetsRoute)
    .use("/config", configRoute)
    .use("/conversion", conversionRoute)
    .use("/transactions", transactionsRoute)
    .use(serverUtils._404ErrorHandler)
    .use(serverUtils.dbErrorHandler)
    .use(serverUtils.serverErrorHandler)
;