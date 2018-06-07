const
    mongoose = require("mongoose")
    bankAccountSchema = new mongoose.Schema({
        name: {
            type: String,
            required: [true, "name not provided"]
        },
        number: {
            type: String,
            required: [true, "number not provided"]
        },
        bankName: {
            type: String,
            required: [true, "bank name not provided"]
        }
    })
;

module.exports = mongoose.model("Bank Account", bankAccountSchema)
