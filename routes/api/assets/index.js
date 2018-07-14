const router = require('express').Router({ mergeParams: true }),
    path = require('path'),
    multer = require('multer'),
    serverUtils = require('../../../lib/utils'),
    auth = require(path.join(serverUtils.getRootDirectory(), 'lib/auth')),
    { Asset } = require(path.join(serverUtils.getRootDirectory(), 'lib/db')),
    assetsStoragePath = path.join(
        serverUtils.getPublicDirectory(),
        'images/assets');
const db = require('../../../lib/db');

module.exports = router;

router
    .get('/', handleGetAssets)
    .post('/', auth.bounceUnauthenticated, auth.bounceUnauthorised({ admin: true }), multer({ dest: assetsStoragePath }).single('image'), handlePostAsset, )

.param('_id', resolveAsset)

.get('/:_id', handleGetAsset)
    .use(auth.bounceUnauthenticated)
    .use(auth.bounceUnauthorised({ admin: true }))
    .put('/:_id', handlePutAsset)
    .delete('/:_id', handleDeleteAsset)
    .post('/:_id/deposit_address', handlePostDepositAddress)
    .put('/:_id/sellable', handlePutSellable)
    .put('/:_id/buyable', handlePutBuyable)
    .put('/:_id/selling_profit', handlePutAssetSellingProfit)
    .put('/:_id/buying_profit', handlePutAssetBuyingProfit)
    .put('/:_id/image', multer({ dest: assetsStoragePath }).single('image'), handlePutAssetImage);

function handlePutAsset(req, res, next) {
    const body = req.body;
    const id = req.params._id;

    db.Asset.findById(id)
        .exec()
        .then(asset => {
            asset.buyingProfit = body.buyingProfit || asset.buyingProfit;
            asset.sellingProfit = body.sellingProfit || asset.sellingProfit;

            if ((asset.type === 'fiat' && typeof(body.depositAddress)) == 'object' || (asset.type === 'digital' && typeof(body.depositAddress) == 'string')) {
                asset.depositAddress = body.depositAddress || asset.depositAddress;
            }

            return asset.save();
        })
        .then(asset => {
            res._success(asset);
        })
        .catch(err => {
            res._sendError(err);
        })

}

function handlePostAsset(req, res, next) {
    const rawInput = req.body,
        assetDetails = new Asset.Fields();
    try {
        serverUtils.deepAssign(assetDetails, rawInput);
    } catch (err) {
        const unknownField = err.message.match(/property (.+),/)[1];
        return res._sendError(
            'unknown field',
            new serverUtils.ErrorReport(400, {
                [unknownField]: `${unknownField} not recognized`,
            }),
        );
    }
    if (req.file) { details.imagePath = path.join("images/assets", req.file.filename); }
    asset = new Asset(assetDetails);
    asset.save().then(
        (asset) => {
            Asset.add(asset);
            return res._success(asset);
        },
        (err) => {
            return next(err);
        },
    );
}


function handleGetAssets(req, res, next) {
    const { skip = 0, limit = 20, type } = req.query;
    let query = Asset.find({});

    if (type) {
        query.where('type').equals(type);
    }

    query.limit(limit)
        .skip(skip)
        .exec()
        .then(
            (assets) => {
                assets.forEach(function(asset) {
                    asset.price_usd = Asset.get("price_usd", asset.code);
                });
                return res._success(assets);
            },
            (err) => {
                return next(err);
            },
        );
}

function handleGetAsset(req, res, next) {
    const { asset } = req._params;
    return res._success(asset);
}

function handleDeleteAsset(req, res, next) {
    const { asset } = req._params;
    asset.remove().then(
        (asset) => {
            return res._success({ asset });
        },
        (err) => {
            return next(err);
        },
    );
}

function handlePostDepositAddress(req, res, next) {
    const address = req.body,
        { asset } = req._params;
    asset.depositAddress = address;
    asset.save().then(
        (asset) => {
            return res._success(address);
        },
        (err) => {
            return next(err);
        },
    );
}

function handlePutSellable(req, res, next) {
    if (!(req.body && req.body.hasOwnProperty('sellable'))) return res._sendError('missing or invalid parameters', new serverUtils.ErrorReport(400, { sellable: 'sellable not provided' }));
    const { asset } = req._params, { sellable } = req.body;
    asset.sellable = sellable;
    asset.save().then(
        (asset) => {
            return res._success(asset.sellable);
        },
        (err) => {
            return next(err);
        },
    );
}

function handlePutBuyable(req, res, next) {
    if (!(req.body && req.body.hasOwnProperty('buyable'))) return res._sendError('missing or invalid parameters', new serverUtils.ErrorReport(400, { buyable: 'buyable not provided' }));
    const { asset } = req._params, { buyable } = req.body;
    asset.buyable = buyable;
    asset.save().then(
        (asset) => {
            return res._success(asset.buyable);
        },
        (err) => {
            return next(err);
        },
    );
}

function handlePutAssetImage(req, res, next) {
    if (!req.file) {
        return res._sendError(
            "missing or invalid parameters",
            new serverUtils.ErrorReport(400, { image: "image not provided" })
        );
    }
    const imagePath = path.posix.join('images/assets', req.file.filename),
        { asset } = req._params;
    asset.imagePath = imagePath;
    asset.save().then(
        (asset) => {
            return res._success(asset.imagePath);
        },
        (err) => {
            return next(err);
        },
    );
}

function handlePutAssetBuyingProfit(req, res, next) {
    if (!(req.body && req.body.hasOwnProperty('buyingProfit'))) return res._sendError('missing or invalid parameters', new serverUtils.ErrorReport({ buyingProfit: 'buying profit not provided' }));
    const { asset } = req._params, { buyingProfit } = req.body, { _id } = req.params;
    asset.buyingProfit = buyingProfit;
    asset.save().then((asset) => {
        res._success(asset.buyingProfit);
        Asset.set("buyingProfit", asset.code, asset.buyingProfit);
    }, (err) => {
        return next(err)
    });
}

function handlePutAssetSellingProfit(req, res, next) {
    if (!(req.body && req.body.hasOwnProperty('sellingProfit'))) return res._sendError('missing or invalid parameters', new serverUtils.ErrorReport({ sellingProfit: 'selling profit not provided' }));
    const { asset } = req._params, { sellingProfit } = req.body, { _id } = req.params;
    asset.sellingProfit = sellingProfit;
    asset.save().then((asset) => {
        res._success(asset.sellingProfit);
        Asset.set("sellingProfit", asset.code, asset.sellingProfit);
    }, (err) => {
        return next(err)
    });
}

function resolveAsset(req, res, next, _id) {
    Asset.findOne({ _id }).then(
        (asset) => {
            if (!asset)
                return res._sendError(
                    "item not found",
                    new serverUtils.ErrorReport(404, { _id: "_id not found" })
                );
            req._params = req._params || {};
            req._params.asset = asset;
            return next();
        },
        (err) => {
            return next(err);
        },
    );
}