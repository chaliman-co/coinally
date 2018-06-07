const
    router = require('express').Router({ mergeParams: true }),
    serverUtils = require("../../lib/utils"),
    path = require("path"),
    { Config } = require(path.join(serverUtils.getRootDirectory(), "lib/db"))
;

module.exports = router;

router
    .post("/", handlePostConfig)
    .get("/", handleGetConfigs)

    .param("_id", resolveConfig)
    
    .get("/:_id", handleGetConfig)
    .put("/:_id/value", handlePutConfigValue)
    .delete("/:_id", handleDeleteConfig)

function handlePostConfig(req, res, next) {
    const
        configDetails = new Config.Fields(),
        rawInput = req.body
    ;
    try{
        serverUtils.deepAssign(configDetails, rawInput);
    } catch (err) {
        let unknownField = err.message.match(/property (.+),/)[1];
        return res._sendError("unknown field", new serverUtils.ErrorReport(400, { [unknownField]: `${unknownField} not recognized` }))
    }
    config = new Config(configDetails);
    config.save().then(function savedConfig(config) {
        Config.set(config);
        return res._success(config)
    }, function failedToSave(err) {
        return next(err)
    })
}
function handleGetConfigs(req, res, next) {
    Config.find({}).exec().then(function foundConfigs(configs) {
        if (!configs.length) return res._sendError("item not found", new serverUtils.ErrorReport(404, {configs: "no configs found"}));
        return res._success(configs)
    }, function failedToFind(err) {
        return next(err)
    })
}

function resolveConfig(req, res, next, _id) {
    Config.findOne({_id}).exec().then(function foundConfig(config) {
        if (!config) return res._sendError("item not found", new serverUtils.ErrorReport(404, {_id: "_id not found"}));
        req._params = req._params || {};
        req._params.config = config;
        next()
    }, function failedToFind(err) {
        return next(err)
    });
}
function handlePutConfigValue(req, res, next) {
    const
        { config } = req._params,
        { value } = req.body
    ;
    config.value = value;
    config.save().then(function savedConfig(config) {
        res._success(config.value)
        Config.set(config);
    }, function failedToSave(err) {
        return next(err)
    })
}

function handleDeleteConfig(req, res, next) {
    const { config } = req._params;
    config.remove().then(function removedConfig(config) {
        res._success(config)
    }, function failedToRemove(err) {
        return next(err)
    })
}

function handleGetConfig(req, res, next) {
    const { config } = req._params;
    return res._success(config)
}