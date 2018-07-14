const
    serverUtils = require("../../lib/utils"),
    path = require("path"),
    {
        Asset
    } = require(path.join(serverUtils.getRootDirectory(), "lib/db")),
    {
        Config
    } = require(path.join(serverUtils.getRootDirectory(), "lib/db"));

module.exports = handleGetConversionRates;

function handleGetConversionRates(req, res, next) {
    const { from, to } = req.query;
    const assetCodes = { from, to },
        errorDetails = {},
        rates = {};

    for (let asset in assetCodes) {
        let assetCode = assetCodes[asset];
        if (!assetCode) errorDetails[asset] = `${asset} not provided`;
        else if (!Asset.exists(String(assetCode).toLowerCase())) errorDetails[assetCode] = `${assetCode} not found`;
    }
    if (Object.keys(errorDetails).length) {
        return res._sendError("invalid or missing parameters", new serverUtils.ErrorReport(400, errorDetails));
    }

    return res._success(Asset.convert(assetCodes.from, assetCodes.to));
}