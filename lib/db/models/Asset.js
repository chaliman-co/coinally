const axios = require('axios');
const
    mongoose = require('mongoose'),
    crypto = require('crypto'),
    BankAccount = require('./BankAccount'),
    config = require('./Config'),
    socketIoServer = require('../../../socketIoServer'),
    request = require('request'),
    liveAssets = {},
    pendingAssets = [],
    conversionRates = {},
    pendingUpdates = {},
    async = require('async'),

    conversionTable = {
        ngn: {
            ngn: function(ngn, convertToDollars, getOnlineRate, cb) {
                convertToDollars(ngn, rate => {
                    ngnPriceUsd = rate;
                    convertToDollars(this, rate => {
                        myPriceUsd = rate;
                        cb(myPriceUsd / ngnPriceUsd)
                    })
                });
            },
            btc: function(btc, convertToDollars, getOnlineRate, cb) {
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
            ngn: function(ngn, convertToDollars, getOnlineRate, cb) {
                convertToDollars(ngn, rate => {
                    ngnPriceUsd = rate;
                    convertToDollars(this, rate => {
                        myPriceUsd = rate;
                        cb(myPriceUsd / ngnPriceUsd)
                    })
                });
            },
            btc: function(btc, convertToDollars, getOnlineRate, cb) {
                cb(1)
            },
        },
        igusd: {
            ngn: function(ngn, convertToDollars, getOnlineRate, cb) {
                convertToDollars(ngn, rate => {
                    ngnPriceUsd = rate;
                    convertToDollars(this, rate => {
                        myPriceUsd = rate;
                        cb(myPriceUsd / ngnPriceUsd)
                    })
                });
            },
            btc: function(btc, convertToDollars, getOnlineRate, cb) {
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
            Object.assign(liveAssets, assets.map(asset => new assetModel(asset.toObject())));
            updatePrices(Object.values(liveAssets), cb);
        });
    },

    updatePrices = function(assets, cb) {
        async.parallel(
            assets.map(asset => function(next) {
                if (pendingUpdates[asset.code]) {
                    Object.assign(asset, manualUpdate);
                    delete pendingAssets[asset.code];
                }
                liveAssets[asset.code] = asset;
                for (const otherAssetCode in liveAssets) {
                    const otherAsset = liveAssets[otherAssetCode];
                    if (pendingUpdates[otherAsset.code]) {
                        Object.assign(otherAsset, manualUpdate);
                        delete pendingAssets[otherAsset.code];
                    }
                    calculateRate(asset, otherAsset)
                        .then((rate) => {
                            if (rate != conversionRates[`${asset.code }-${otherAsset.code}`]) {
                                conversionRates[`${asset.code }-${otherAsset.code}`] = rate; // like btc-eth
                                socketIoServer.of('/rates').in(`${asset.code }-${otherAsset.code}`).emit('new_rate', rate);
                            }
                        })
                        .catch(err => {
                            console.log('Asset update', err.message)
                        });
                }
                next();
            }),
            (err) => {
                if (err) throw err;
                else {
                    setTimeout(updatePrices,
                        config.get('RATES_REFRESH_INTERVAL'),
                        Object.values(liveAssets).concat(pendingAssets.splice(0, Number.MAX_VALUE)));
                    if (cb) cb();
                }
            },
        );
    },

    // convertToDollars = function convertToDollars(asset, cb) {
    //     if (asset.type === 'fiat') return cb(asset.price_usd);
    // },

    get = function getLiveValue(code, key) {
        const asset = liveAssets[code];
        console.log(asset);
        if (!asset) {
            return null;
        }
        if (!key) {
            return asset; // return whole asset if only code is provided
        }
        return liveAssets[code][key];
    },

    convert = function convert(from, to) {
        return conversionRates[`${from}-${to}`];
    },

    add = function add(asset) {
        pendingAssets.push(new assetModel(asset.toObject()));
    },

    exists = function exists(code) {
        return code in liveAssets;
    },

    set = function setLiveValue(key, code, value) {
        pendingUpdates[code] = {
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
    conversionRates,
    exists,
    convert,
});

const assetModel = mongoose.model('Asset', assetSchema);

module.exports = assetModel;


function calculateRate(asset, otherAsset) {
    if (asset.type === 'digital' && otherAsset.type === 'fiat')
        return handleDigitalToFiat(asset, otherAsset);
    // else if (asset.type === 'digital' && otherAsset.type === 'digital')
    //     handleDigitalToDigital(asset, otherAsset);
    // else if (asset.type === 'card' && otherAsset.type === 'digital')
    //     handleCardToDigital(asset, otherAsset);
    else if (asset.type === 'card' && otherAsset.type === 'fiat')
        return handleCardToFiat(asset, otherAsset);
    else if (asset.type === 'fiat' && otherAsset.type === 'digital')
        return handleFiatToDigital(asset, otherAsset);
    return new Promise((resolve, reject) => reject(new Error("Can't convert assets")));
}

function handleDigitalToFiat(digitalAsset, fiatAsset, cb) {
    return new Promise((resolve, reject) => {
        if (isNaira(fiatAsset)) {
            getDollarRate(digitalAsset)
                .then(rate => {
                    let nairaRate = rate / fiatAsset.price_usd;
                    let paddedRate = (1 - 0.01 * digitalAsset.buyingProfit) * nairaRate;
                    resolve(resolve(Number(paddedRate.toFixed(2))));
                })
                .catch(err => reject(err));
        } else {
            reject(new Error("Not implemented"));
        }
    })
}

function handleFiatToDigital(fiatAsset, digitalAsset, cb) {
    return new Promise((resolve, reject) => {
        if (isNaira(fiatAsset)) {
            getDollarRate(digitalAsset)
                .then(rate => {
                    let nairaRate = rate / fiatAsset.price_usd;
                    let paddedRate = (1 + 0.01 * digitalAsset.sellingProfit) * nairaRate;
                    let actualRate = 1 / paddedRate;
                    resolve(actualRate);
                })
                .catch(err => reject(err));
        } else {
            reject(new Error("Not implemented"));
        }
    })
}

function handleCardToFiat(cardAsset, fiatAsset, cb) {
    return new Promise((resolve, reject) => {
        if (isNaira(fiatAsset)) {
            let cardDollarPrice = cardAsset.price_usd;
            //Card price in dollars / Naira price in dollars
            let rate = cardDollarPrice / fiatAsset.price_usd;
            // console.log(rate);
            let paddedRate = (1 - 0.01 * cardAsset.buyingProfit) * rate;
            resolve(Number(paddedRate.toFixed(2)));
        } else {
            reject(new Error("Not implemented"));
        }
    })
}

function getDollarRate(asset) {
    // if (asset.type === 'fiat') return cb(asset.price_usd);
    // else 
    return getRateOnline(asset.code, 'usd');
}

function getRateOnline(fromCode, toCode) {
    const url = `https://www.bitstamp.net/api/v2/ticker/${fromCode.toLowerCase()}${toCode.toLowerCase()}/`;

    return new Promise((resolve, reject) => {
        axios.get(url)
            .then(response => resolve(response.data.last))
            .catch(err => reject(err));
    })
}

function isNaira(asset) {
    return asset.name === 'naira';
}