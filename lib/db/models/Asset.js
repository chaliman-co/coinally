const
    mongoose = require("mongoose"),
    crypto = require("crypto"),
    BankAccount = require("./BankAccount"),
    config = require("./Config"),
    socketIoServer = require("../../../socketIoServer")
request = require("request"),
    live_assets_details = {},
    pending_assets = [],
    conversion_rates = {},
    pending_updates = {},
    async = require("async"),

    assetSchema = mongoose.Schema({

        type: {
            type: String,
            enum: ["digital", "fiat", "card"],
            required: [true, "type not specified"],
        },

        price_usd: {
            type: Number,
            default: null,
            validate: {
                validator: function validatePrice_usd(price) {
                    if (this.type === "digital") return !price;
                    if (this.type === "fiat") return !isNaN(price);
                },
                message: "price_usd invalid"
            }
        },

        name: {
            type: String,
            unique: true,
            required: [true, "name not provided"]
        },
        imagePath: String,

        addressType: {
            type: String,
            enum: ["url", "bank account"],
            required: [true, "address type not provided"]
        },

        code: {
            type: String,
            unique: true,
            lowercase: true,
            required: [true, "code not provided"]
        },

        sellable: {
            type: Boolean,
            default: true
        },

        buyable: {
            type: Boolean,
            default: true
        },

        sellingProfit: {
            type: Number,
            required: [true, "selling profit not provided"],
            validate: {
                validator: function rejectNaN(value) {
                    return !isNaN(value)
                },
                message: "selling profit not valid"
            }
        },

        buyingProfit: {
            type: Number,
            required: [true, "buying profit not provided"],
            validate: {
                validator: function rejectNaN(value) {
                    return !isNaN(value)
                },
                message: "buying profit not valid"
            }
        },

        minDepositAmount: {
            type: Number,
            required: [true, "minimum deposit amount not provided"],
            validate: {
                validator: function rejectNaN(value) {
                    return !isNaN(value)
                },
                message: "minimum deposit amount not valid"
            }
        },

        maxDepositAmount: {
            type: Number,
            required: [true, "maximum deposit amount not provided"],
            validate: {
                validator: function rejectNaN(value) {
                    return !isNaN(value)
                },
                message: "maximum deposit amount not valid"
            }
        },

        depositAddress: {
            type: mongoose.Schema.Types.Mixed,
            validate: {
                isAsync: true,
                validator: function validateAddress(address, cb) {
                    {
                        if (this.addressType === "bank account") {
                            try {
                                const testBankAccount = new BankAccount(address);
                                testBankAccount.validateSync();
                                return cb(true)
                            } catch (err) {
                                return cb(false)
                            }
                        } else if (this.addressType === "url") {
                            this.address = String(this.address) //make sure it is a string
                            return cb(true)
                        }
                        return cb(false)
                    }

                },
                message: "deposit address invalid"
            },
            required: [true, "deposit address not provided"]
        }
    }),
    assetFields = function makeFields() {
        Object.assign(this, {
            name: undefined,
            imagePath: undefined,
            addressType: undefined,
            depositAddress: undefined,
            type: undefined,
            code: undefined,
            price_usd: false,
            buyingProfit: undefined,
            sellingProfit: undefined,
            minDepositAmount: undefined,
            maxDepositAmount: undefined,
        });
        Object.preventExtensions(this);
    },

    getLive = function getLive(cb) {
        assetModel.find({}).then(function foundAssets(assets) {
            updatePrices(assets.map(function (asset) {
                return new assetModel(asset.toObject())
            }), new Uint32Array(crypto.randomFillSync(new Uint8Array(new ArrayBuffer(4))).buffer), cb)
        })
    },

    updatePrices = function (assets, updateId, cb) {
        async.parallel(assets.map(function (asset) {
            return function (next) {
                _convertToDollars(asset, function (rate) {
                    let manualUpdate;
                    if (manualUpdate = pending_updates[asset.code]) {
                        console.log("manual update: ", manualUpdate)
                        Object.assign(asset, manualUpdate);
                        delete pending_assets[asset.code]
                    }
                    asset.changedOnUpdate = !!(manualUpdate || (rate != asset.price_usd));
                    asset.price_usd = rate;
                    asset.updateId = updateId;
                    live_assets_details[asset.code] = asset;
                    for (let otherAssetCode in live_assets_details) {
                        let otherAsset = live_assets_details[otherAssetCode];
                        if (otherAsset.updateId === updateId && (asset.changedOnUpdate || otherAsset.changedOnUpdate || !conversion_rates[otherAsset.code + "-" + asset.code])) {
                            let thisAsset2OtherAssetPrice = calculateRate(asset, otherAsset);
                            conversion_rates[asset.code + "-" + otherAsset.code] = thisAsset2OtherAssetPrice; //like btc-eth
                            socketIoServer.of("/rates").in(asset.code + "-" + otherAsset.code).emit("new_rate", thisAsset2OtherAssetPrice);
                            if (asset !== otherAsset) {
                                let otherAssetToThisAssetPrice = calculateRate(otherAsset, asset);
                                conversion_rates[otherAsset.code + "-" + asset.code] = otherAssetToThisAssetPrice; //like btc-eth
                                socketIoServer.of("/rates").in(otherAsset.code + "-" + asset.code).emit("new_rate", otherAssetToThisAssetPrice);
                            }
                        }
                    }
                    live_assets_details[asset.code] = asset;
                    next()
                });
            }
        }), function (err) {
            if (err) throw err;
            else {
                setTimeout(updatePrices, config.get("RATES_REFRESH_INTERVAL"), Object.values(live_assets_details).concat(pending_assets.splice(0, Number.MAX_VALUE)), new Uint32Array(crypto.randomFillSync(new Uint8Array(new ArrayBuffer(4))).buffer));
                if (cb) cb();
            }
        });
    },

    _convertToDollars = function _convertToDollars(asset, cb) {
        if (asset.type === "fiat") return cb(asset.price_usd);
        else if (asset.type === "digital") {
            const requestOptions = {
                url: `https://www.bitstamp.net/api/v2/ticker/${asset.code.toLowerCase()}usd/`,
                method: "GET"
            }
            request(requestOptions, function gotResponse(err, response, body) {
                if (err) throw err;
                return cb(JSON.parse(body).last)
            })
        }
    },

    get = function getLiveValue(key, code) {
        if (!code) return live_assets_details[key];  //return whole asset if only code is provided 
        return live_assets_details[code][key]
    },

    convert = function convert(from, to) {
        return conversion_rates[from + "-" + to]
    },

    add = function add(asset) {
        pending_assets.push(new assetModel(asset.toObject()));
    },

    exists = function exists(code) {
        return code in live_assets_details
    }

set = function setLiveValue(key, code, value) {
    pending_updates[code] = {
        [key]: value
    };
};
assetSchema.pre("save", function checkPriceUsd(next) {
    if (this.type === "fiat" && !this.price_usd) this.invalidate("price_usd", "price_usd not provided");
    next()
})

Object.assign(assetSchema.statics, {
    Fields: assetFields,
    get,
    add,
    set,
    getLive,
    conversion_rates,
    exists,
    convert
});

const assetModel = mongoose.model("Asset", assetSchema);
module.exports = assetModel;

function calculateRate(asset, otherAsset) {
    let
        thisAsset2DollarPrice = asset.price_usd,
        otherAsset2DollarPrice = otherAsset.price_usd,
        buyingProfit = asset.buyingProfit,
        sellingProfit = otherAsset.sellingProfit, //in USD
        dollar2OtherAssetPrice = 1 / otherAsset2DollarPrice,
        paddedRate, thisAsset2OtherAssetPrice, otherAssetToThisAssetPrice;
    thisAsset2DollarPrice -= buyingProfit;
    thisAsset2DollarPrice -= sellingProfit;
    thisAsset2OtherAssetPrice = thisAsset2DollarPrice * dollar2OtherAssetPrice;
    return thisAsset2OtherAssetPrice
}