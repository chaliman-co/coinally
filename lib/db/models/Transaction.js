const mongoose = require('mongoose');
const Config = require('./Config');
const Asset = require('./Asset');
const User = require('./User');
const enums = require('../../enum');

const cardDetailSchema = mongoose.Schema({
    imageUrl: {
        type: String,
        required: true,
    },
    receiptUrl: {
        type: String,
        required: false,
    },
});

const transactionSchema = mongoose.Schema({
    depositAmount: {
        type: Number,
        required: [true, 'deposit amount not provided'],
        validate: {
            validator: function checkIfNumber(amount) {
                return !isNaN(amount);
            },
            message: 'deposit amount not valid',
        },
    },
    receiptAmount: {
        type: Number,
        validate: {
            isAsync: true,
            validator: function validateAmount(amount, cb) {
                if (isNaN(amount)) {
                    return cb(false, 'receipt amount invalid');
                }
                try {
                    if (this.receiptAsset.type === 'fiat' && !this.user.assetAccounts[this.receiptAddress].isVerified) {
                        const amountInUsd = amount * this.receiptAsset.price_usd; // convert receipt amount to usd. The price_usd for fiats is constant so don't worry about changes in-between validation and creation
                        const unVerifiedTransactionLimit = Config.get('UNVERIFIED_TRANSACTION_LIMIT'); // value is in usd

                        if (amountInUsd > unVerifiedTransactionLimit) {
                            return cb(false, 'bank account not verified');
                        }
                    }
                } catch (err) {
                    // either this.receiptAsset/this.user is undefined or this.reciptAddress is not in user's asssetAccounts
                    return cb(false, 'receipt amount invalid');
                }
                return cb(true); // well, if it's for crypto, any amount goes
            },
            message: 'receipt amount invalid',
        },
    },
    rate: {
        type: Number,
    },
    createdAt: {
        type: Date,
        required: [true, 'date not provided'],
        default: Date.now,
        validate: {
            validator: function checkIfNumber(amount) {
                return !isNaN(amount);
            },
            message: 'date not valid',
        },
    },
    depositAssetCode: {
        type: String,
        required: [true, 'deposit asset code not provided'],
        validate: {
            validator: function checkIfAssetExists(code) {
                return Asset.exists(code);
            },
            message: 'asset not found',
        },
    },
    receiptAssetCode: {
        type: String,
        required: [true, 'receipt asset id not provided'],
        validate: {
            validator: function checkIfAssetExists(code) {
                return Asset.exists(code);
            },
            message: 'asset not found',
        },
    },
    depositAsset: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Asset',
    },
    receiptAsset: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Asset',
    },
    status: {
        type: String,
        enum: Object.values(enums.txStatus),
        default: enums.txStatus.AWAITING_PAYMENT,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'user id not provided'],
        validate: {
            validator(user) {
                return !!user;
            },
            message: 'user not found',
        },
    },
    receiptAddress: {
        type: String,
        validate: {
            validator(address) {
                /** address is either an array index indicating
                 * which of the user's asset account to send money to or an address url
                 * * */
                try {
                    if (this.receiptAsset.type === 'fiat') {
                        return this.user.assetAccounts[address] &&
                            typeof (this.user.assetAccounts[address]).address === 'object'; // check if the index exists and is a bank account
                    }
                    if (this.receiptAsset.type === 'digital') return true;
                } catch (err) { // Either this.receiptAsset or this.user is undefined
                    return false;
                }
                return true;
            },
            message: 'receipt address invalid',
        },
    },
    refundAddress: {
        type: String,
        validate: {
            validator(address) {
                // address is either an array index indicating
                // which of the user's asset account to send money to or an address url
                try {
                    if (this.depositAsset.type === 'fiat') {
                        return this.user.assetAccounts[address] &&
                            typeof (this.user.assetAccounts[address]).address === 'object';
                    } // check if the index exists and is a bank account
                    if (this.depositAsset.type === 'digital') return true;
                } catch (err) {
                    // Either this.depositAsset or this.user is undefined
                    return false;
                }
                return false;
            },
            message: 'refund address invalid',
        },
    },
    cardDetail: {
        type: cardDetailSchema,
        required: [
            function validateCard() {
                return this.depositAsset.type === 'card';
            },
            'Card detail not found',
        ],
        // validate: {
        //     validator(detail) {
        //         return !(this.depositAsset.type === 'card' && detail);
        //     },
        //     message: 'Card detail not found',
        // },
    },
    updatedAt: {
        type: Date,
        required: [true, 'update time not provided'],
        default: Date.now,
    },
});

transactionSchema.statics.Fields = function makeFields() {
    Object.assign(this, {
        user: undefined,
        depositAssetCode: undefined,
        depositAmount: undefined,
        receiptAssetCode: undefined,
        receiptAddress: undefined,
        refundAddress: undefined,
        cardDetail: undefined,
    });
    Object.preventExtensions(this);
};

transactionSchema.pre('validate', function applyVerificationRule(next) {
    if (this.status !== enums.txStatus.AWAITING_PAYMENT) {
        next();
    } else if (this.depositAssetCode && this.receiptAssetCode) {
        this.depositAsset = Asset.get(this.depositAssetCode);
        this.receiptAsset = Asset.get(this.receiptAssetCode);

        if (this.depositAsset.type === 'card') {
            this.status = enums.txStatus.PAYMENT_RECEIVED;
        }

        this.rate = Asset.convert(this.depositAssetCode, this.receiptAssetCode);

        this.receiptAmount = this.depositAmount * this.rate;

        User.findOne({ _id: this.user })
            .then((user) => {
                this.user = user;
                next();
            })
            .catch((err) => {
                this.user = null;
                next(err);
            });
    }
});

module.exports = mongoose.model('Transaction', transactionSchema);
