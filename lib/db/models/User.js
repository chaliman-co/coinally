const mongoose = require('mongoose');
const phoneUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance();
const BankAccount = require('./BankAccount');
const Asset = require('./Asset');

const assetAccountSchema = new mongoose.Schema({
    asset: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Asset',
        required: [true, 'asset id not provided'],
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    created: {
        type: Date,
        default: Date.now,
    },
    address: {
        required: [true, 'address not provided'],
        type: mongoose.Schema.Types.Mixed,
        validate: {
            isAsync: true,
            validator: function validateAddress(address, cb) {
                Asset.findById(this.asset, 'addressType')
                    .then(function foundAsset(asset) {
                        if (!asset) {
                            return cb(false, 'asset id not found');
                        }
                        if (asset.addressType === 'bank account') {
                            try {
                                const testBankAccount = new BankAccount(address);
                                testBankAccount.validateSync();
                                return cb(true);
                            } catch (err) {
                                return cb(false, 'address invalid');
                            }
                        } else if (asset.addressType === 'url') {
                            this.address = String(this.address); // make sure it is a string
                            return cb(true);
                        }
                        return cb(false);
                    })
                    .catch(err => cb(err));
            },
        },
        message: 'address invalid',
    },
});

const phoneNumberSchema = new mongoose.Schema({
    digits: {
        type: String,
        required: [true, 'digits not provided'],
    },
    region: {
        type: String,
        required: [true, 'region not provided'],
    },
});

const verificationDetailSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['bvn', 'id card'],
        required: [true, 'type not provided'],
    },
    name: String, // eg. driver's license
    imagePath: String,
    number: {
        type: String,
    },
    isApproved: {
        type: Boolean,
        default: false,
    },
});

const verificationCodeSchema = new mongoose.Schema({
    value: {
        type: String,
        required: [true, 'value not provided'],
    },
    expiresIn: {
        type: Number,
        required: [true, 'expiry date not provided'],
    },
});

// const updatesSchema = new mongoose.Schema({
//     field: {
//         type: String,
//         required: [true, 'field not provided'],
//     },
//     value: {
//         type: String,
//         required: [true, 'value not provided'],
//     },
//     code: {
//         type: verificationCodeSchema,
//         required: [true, 'code not provided'],
//     },
// });

const userSchema = mongoose.Schema({
    verificationCode: verificationCodeSchema,
    isVerified: {
        type: Boolean,
        default: false,
    },

    firstName: {
        type: String,
        required: [true, 'first name not provided'],
        lowercase: true,
    },

    lastName: {
        type: String,
        required: [true, 'last name not provided'],
        lowercase: true,
    },

    country: {
        type: String,
        required: [true, 'country not provided'],
    },

    status: {
        type: String,
        enum: ['active', 'banned'],
        default: 'active',
    },

    refCode: {
        type: String,
    },

    referrer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        // validate: {
        //     isAsync: true,
        //     validator: function validateAddress(referrer, cb) {
        //         User.find({ referrer })
        //             .then((user) => {
        //                 if (!user) return cb(false, 'User not found');
        //                 return cb(true);
        //             }, err => cb(err));
        //     },
        // },
    },

    imagePath: String,

    role: {
        type: String,
        enum: ['admin', 'user'],
        default: 'user',
    },

    phoneNumber: {
        type: phoneNumberSchema,
        required: [true, 'phone number not provided'],
        validate: {
            validator: function validatePhoneNumber(number) {
                let phoneNumber;
                try {
                    phoneNumber = phoneUtil.parseAndKeepRawInput(number.digits, number.region);
                } catch (err) {
                    return false;
                }
                return phoneUtil.isValidNumberForRegion(phoneNumber, number.region);
            },
            message: 'phone number invalid',
        },
    },

    emailAddress: {
        type: String,
        unique: true,
        required: [true, 'email address not provided'],
        validate: {
            validator: function validateEmail(val) {
                return /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/i.test(val);
            },
            message: 'email address invalid',
        },
    },

    assetAccounts: [{
        type: assetAccountSchema,
    }],

    verificationDetails: [{
        type: verificationDetailSchema,
    }],

    transactionCount: {
        type: Number,
        default: 0,
    },

    createdAt: {
        type: Date,
        default: new Date(),
    },

});

const verificationDetailFields = function makeFields() {
    Object.assign(this, {
        type: undefined,
        name: undefined,
        number: undefined,
        imagePath: undefined,
    });
    Object.preventExtensions(this);
};

const assetAccountsFields = function makeFields() {
    Object.assign(this, {
        asset: undefined,
        address: undefined,
    });
    Object.preventExtensions(this);
};

const PhoneNumberFields = function makeFields() {
    Object.assign(this, {
        digits: undefined,
        region: undefined,
    });
    Object.preventExtensions(this);
};

const UserFields = function makeFields() {
    Object.assign(this, {
        phoneNumber: new PhoneNumberFields(),
        lastName: undefined,
        firstName: undefined,
        emailAddress: undefined,
        imagePath: undefined,
        country: undefined,
        referrer: undefined,
        refCode: undefined,
    });
    Object.preventExtensions(this);
};

Object.assign(userSchema.statics, {
    Fields: UserFields,
    verificationDetails: {
        Fields: verificationDetailFields,
    },
    assetAccounts: {
        Fields: assetAccountsFields,
    },
});

userSchema.pre('validate', function validateVeification(next) {
    this.verificationDetails
        .forEach((vDetail) => {
            const index = this.verificationDetails.indexOf(vDetail);
            if (vDetail) {
                if (vDetail.type === 'bvn' && !/^\d{11}$/.test(vDetail.number)) {
                    this.invalidate(`verificationDetails[${index}]`, 'verification detail invalid');
                } else if (vDetail.type !== 'bvn' && !vDetail.imagePath) {
                    this.invalidate(`verificationDetails[${index}]`, 'verification detail invalid');
                }
            }
        });
    next();
});

module.exports = mongoose.model('User', userSchema);
