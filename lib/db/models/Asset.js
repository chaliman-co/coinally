const
    mongoose = require('mongoose'),
    crypto = require('crypto'),
    BankAccount = require('./BankAccount'),
    config = require('./Config'),
    socketIoServer = require('../../../socketIoServer'),
    request = require('request'),
    live_assets_details = {},
    pending_assets = [],
    conversion_rates = {},
    pending_updates = {},
    async = require('async'),

    conversionTable = {
        ngn: {
            ngn: function (ngn, convertToDollars, getOnlineRate, cb) {
                convertToDollars(ngn, rate => {
                    ngnPriceUsd = rate;
                    convertToDollars(this, rate => {
                        myPriceUsd = rate;
                        cb(myPriceUsd / ngnPriceUsd)
                    })
                });
            },
            btc: function (btc, convertToDollars, getOnlineRate, cb) {
                convertToDollars(btc, rate => {
                    btcPriceUsd = rate;
                    convertToDollars(this, rate => {
                        myPriceUsd = rate;
                        cb(myPriceUsd / btcPriceUsd)
                    })
                });
            },
        },
        btc: {
            ngn: function (ngn, convertToDollars, getOnlineRate, cb) {
                convertToDollars(ngn, rate => {
                    ngnPriceUsd = rate;
                    convertToDollars(this, rate => {
                        myPriceUsd = rate;
                        cb(myPriceUsd / ngnPriceUsd)
                    })
                });
            },
            btc: function (btc, convertToDollars, getOnlineRate, cb) {
                cb(1)
            },
        },
        igusd: {
            ngn: function (ngn, convertToDollars, getOnlineRate, cb) {
                convertToDollars(ngn, rate => {
                    ngnPriceUsd = rate;
                    convertToDollars(this, rate => {
                        myPriceUsd = rate;
                        cb(myPriceUsd / ngnPriceUsd)
                    })
                });
            },
            btc: function (btc, convertToDollars, getOnlineRate, cb) {
                convertToDollars(btc, rate => {
                    btcPriceUsd = rate;
                    convertToDollars(this, rate => {
                        myPriceUsd = rate;
                        cb(myPriceUsd / btcPriceUsd)
                    })
                });
            },
        },
    },

    assetSchema = mongoose.Schema({

        type: {
            type: String,
            enum: ['digital', 'fiat', 'card'],
            required: [true, 'type not specified'],
        },

        price_usd: {
            type: Number,
            default: null,
            validate: {
                validator: function validatePrice_usd(price) {
                    if (this.type === 'digital') return !price;
                    if (this.type === 'fiat') return !isNaN(price);
                },
                message: 'price_usd invalid',
            },
        },

        name: {
            type: String,
            unique: true,
            required: [true, 'name not provided'],
        },
        imagePath: String,

        addressType: {
            type: String,
            enum: ['url', 'bank account', "image"],
            required: [true, 'address type not provided'],
        },

        code: {
            type: String,
            unique: true,
            lowercase: true,
            required: [true, 'code not provided'],
        },

        sellable: {
            type: Boolean,
            default: true,
        },

        buyable: {
            type: Boolean,
            default: true,
        },

        sellingProfit: {
            type: Number,
            required: [true, 'selling profit not provided'],
            validate: {
                validator: function rejectNaN(value) {
                    return !isNaN(value);
                },
                message: 'selling profit not valid',
            },
        },

        cryptoToCryptoProfit: {
            type: Number,
            validate: {
                validator: function rejectNaN(value) {
                    return !isNaN(value);
                },
                message: 'crypto to crypto profit not valid',
            },
        },

        conversionTable: { //  table of conversion schemes. contains a map of asset codes to function bodies. functions are to be bound to the asset, and provided with other Asset as its code, a convertToDollars method, a getOnlineRate Function, and a cb callback.
            type: mongoose.Schema.Types.Mixed,
            default: {
                ngn: 'convertToDollars(ngn, rate => {ngnPriceUsd = rate; convertToDollars(this, rate => {myPriceUsd = rate; cb(myPriceUsd / ngnPriceUsd)})});',
            },
        },

        buyingProfit: {
            type: Number,
            required: [true, 'buying profit not provided'],
            validate: {
                validator: function rejectNaN(value) {
                    return !isNaN(value);
                },
                message: 'buying profit not valid',
            },
        },

        minDepositAmount: {
            type: Number,
            required: [true, 'minimum deposit amount not provided'],
            validate: {
                validator: function rejectNaN(value) {
                    return !isNaN(value);
                },
                message: 'minimum deposit amount not valid',
            },
        },

        maxDepositAmount: {
            type: Number,
            required: [true, 'maximum deposit amount not provided'],
            validate: {
                validator: function rejectNaN(value) {
                    return !isNaN(value);
                },
                message: 'maximum deposit amount not valid',
            },
        },

        depositAddress: {
            type: mongoose.Schema.Types.Mixed,
        },
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
        assetModel.find({}).then((assets) => {
            Object.assign(live_assets_details, assets.map(asset => new assetModel(asset.toObject())));
            updatePrices(Object.values(live_assets_details), cb);
        });
    },

    updatePrices = function (assets, cb) {
        async.parallel(
            assets.map(asset => function (next) {
                if (pending_updates[asset.code]) {
                    Object.assign(asset, manualUpdate);
                    delete pending_assets[asset.code];
                }
                live_assets_details[asset.code] = asset;
                for (const otherAssetCode in live_assets_details) {
                    const otherAsset = live_assets_details[otherAssetCode];
                    if (pending_updates[otherAsset.code]) {
                        Object.assign(otherAsset, manualUpdate);
                        delete pending_assets[otherAsset.code];
                    }
                    calculateRate(asset, otherAsset, (rate) => {
                        if (rate != conversion_rates[`${asset.code }-${otherAsset.code}`]) {
                            conversion_rates[`${asset.code }-${otherAsset.code}`] = rate; // like btc-eth
                            socketIoServer.of('/rates').in(`${asset.code }-${otherAsset.code}`).emit('new_rate', rate);
                        }
                    });
                }
                next();
            }),
            (err) => {
                if (err) throw err;
                else {
                    setTimeout(updatePrices, config.get('RATES_REFRESH_INTERVAL'), Object.values(live_assets_details).concat(pending_assets.splice(0, Number.MAX_VALUE)));
                    if (cb) cb();
                }
            },
        );
    },

    convertToDollars = function convertToDollars(asset, cb) {
        if (asset.type === 'fiat' || asset.type == 'card') return cb(asset.price_usd);
        else if (asset.type === 'digital') {
            const requestOptions = {
                url: `https://www.bitstamp.net/api/v2/ticker/${asset.code.toLowerCase()}usd/`,
                method: 'GET',
            };
            request(requestOptions, (err, response, body) => {
                if (err) throw err;
                return cb(JSON.parse(body).last);
            });
        } else throw new Error('cannot convert asset');
    },
    getOnlineRate = function getOnlineRate(asset, otherAsset, cb) {
        const requestOptions = {
            url: `https://www.bitstamp.net/api/v2/ticker/${asset.code.toLowerCase()}${otherAsset.code.toLowerCase()}/`,
            method: 'GET',
        };
        request(requestOptions, (err, response, body) => {
            if (err) throw err;
            return cb(JSON.parse(body).last);
        });
    },

    get = function getLiveValue(key, code) {
        if (!code) return live_assets_details[key]; // return whole asset if only code is provided
        return live_assets_details[code][key];
    },

    convert = function convert(from, to) {
        return conversion_rates[`${from}-${to}`];
    },

    add = function add(asset) {
        pending_assets.push(new assetModel(asset.toObject()));
    },

    exists = function exists(code) {
        return code in live_assets_details;
    },

    set = function setLiveValue(key, code, value) {
        pending_updates[code] = {
            [key]: value,
        };
    };

assetSchema.pre('validate', function checkCryptoToCryptoProfit(next) {
    validations: {
        if (this.type == 'digital' && isNaN(this.cryptoToCryptoProfit)) this.invalidate('cryptoToCryptoProfit', 'crypto to crypto profit not provided');
        if (!this.depositAddress & this.addressType != 'image') this.invalidate('depositAddress', 'deposit address not provided');
        else if (this.addressType == 'bank account') {
            try {
                const testBankAccount = new BankAccount(this.depositAddress);
                testBankAccount.validateSync();
            } catch (err) {
                this.invalidate('depositAddress', 'deposit address invalid');
            }
        } else if (this.addressType == 'url') {
            this.address = String(this.address); // make sure it is a string
        }

        if (this.type == 'digital' && isNaN(this.cryptoToCryptoProfit)) this.invalidate('cryptoToCryptoProfit', 'crypto to crypto profit not provided');
    }
    return next();
});
assetSchema.pre('save', function checkPriceUsd(next) {
    if (this.type == 'fiat' && !this.price_usd) this.invalidate('price_usd', 'price_usd not provided');
    return next();
});

Object.assign(assetSchema.statics, {
    Fields: assetFields,
    get,
    add,
    set,
    getLive,
    conversion_rates,
    exists,
    convert,
});

const assetModel = mongoose.model('Asset', assetSchema);
module.exports = assetModel;

function calculateRate(asset, otherAsset, cb) {console.log(asset.code, otherAsset)
    const conversionFunc = conversionTable[asset.code][otherAsset.code].bind(asset);
    return conversionFunc(otherAsset, convertToDollars, getOnlineRate, (rate) => {
        const asset2OtherAssetRate = rate;
        if (asset.type == 'fiat' || otherAsset.type == 'fiat') {
            const reverseConversionFunc = conversionTable[otherAsset.code][asset.code].bind(otherAsset);
            return reverseConversionFunc(asset, convertToDollars, getOnlineRate, (rate) => {
                const otherAssetToAssetRate = rate;
                let paddedRate;
                if (asset.name == 'naira') paddedRate = 1 / (otherAssetToAssetRate + otherAsset.sellingProfit);
                else if (otherAsset.name == 'naira') paddedRate = asset2OtherAssetRate - asset.buyingProfit;
                return cb(paddedRate);
            });
        }
        if (asset.type == 'digital' && otherAsset.type == 'digital') {
            return cb(asset2OtherAssetRate - asset.cryptoToCryptoProfit);
        }
        throw new Error('cannot calculate');
    });
}
