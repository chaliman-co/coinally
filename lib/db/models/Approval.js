const
    mongoose = require("mongoose"),
    approvalSchema = new mongoose.Schema({
        status: {
            type: String,
            required: [true, "status not provided"],
            enum: ["granted", "rejected", "pending", "aborted"],
            default: "pending"
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: [true, "user id not provided"],
            ref: "User"
        },
        userProperty: {
            type: String,
            required: [true, "user property not provided"]
        },
        dateCreated: {
            type: Date,
            default: Date.now
        }
    })
;
approvalSchema.statics.Fields = function makeFields() {
    Object.assign(this, {
        user: undefined,
        userProperty: undefined
    });
    Object.preventExtensions(this)
}
module.exports = mongoose.model("Approval", approvalSchema)