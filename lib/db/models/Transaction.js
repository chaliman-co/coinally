const mongoose = require("mongoose"),
  Config = require("./Config"),
  Asset = require("./Asset"),
  transactionSchema = mongoose.Schema({
    depositAmount: {
      type: Number,
      required: [true, "deposit amount not provided"],
      validate: {
        validator: function checkIfNumber(amount) {
          return !isNaN(amount);
        },
        message: "deposit amount not valid"
      }
    },
    receiptAmount: {
      type: Number,
      required: [true, "receipt amount not provided"],
      validate: {
        validator: function checkIfNumber(amount) {
          return !isNaN(amount);
        },
        message: "receipt amount not valid"
      }
    },
    rate: {
      type: Number,
      required: [true, "rate not provided"],
      validate: {
        validator: function checkIfNumber(amount) {
          return !isNaN(amount);
        },
        message: "rate not valid"
      }
    },
    createdAt: {
      type: Date,
      required: [true, "date not provided"],
      default: Date.now
    },
    depositAssetCode: {
      type: String,
      required: [true, "deposit asset id not provided"],
      validate: {
          validator: function checkIfAssetExists(code) {
            return !!Asset.price_map[code]
          },
          message: "asset not found"
      }
    },
    receiptAssetCode: {
      type: String,
      required: [true, "receipt asset id not provided"],
        validate: {
            validator: function checkIfAssetExists(code) {
                return !!Asset.price_map[code]
            },
            message: "asset not found"
      }
    },

    status: {
      type: String,
      enum: ["completed", "failed", "payment_received", "initialized"],
      default: "initialized"
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    updatedAt: {
      type: Date,
      required: [true, "update date provided"],
      default: Date.now
    }
  })
;

transactionSchema.statics.Fields = function makeFields() {
    Object.assign(this, {
        user: undefined,
        depositAssetCode: undefined,
        depositAmount: undefined,
        receiptAssetCode: undefined,
        rate: 0,
        receiptAmount: undefined
    });
    Object.preventExtensions(this);
};

transactionSchema.pre("validate",  function applyVerificationRule(next) {
    if (!this.receiptAssetCode === "ngn") return next();
    const
        unVerifiedTransactionLimit = Config.get("UNVERIFIED_TRANSACTION_LIMIT"),
        amount = Asset.convertToDollars(this.receiptAssetCode) * this.receivingAmount  // result is in usd
        ;
    if (amount > unVerifiedTransactionLimit) return this.invalidate("depositAssetCode", "bank account not verified");
    return next()
})

module.exports = mongoose.model("Transaction", transactionSchema);
