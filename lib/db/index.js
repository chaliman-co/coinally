const
    mongoose = require("mongoose"),
    url = "mongodb://chalu:89575684gA.@ds247410.mlab.com:47410/coinally",
    Asset = require("./models/Asset"),
    Transaction = require("./models/Transaction"),
    User = require("./models/User"),
    Config = require("./models/Config"),
    Approval = require("./models/Approval");
Object.assign(exports, {
    connection: mongoose.connection,
    connect: mongoose.connect,
    url,
    Asset,
    Transaction,
    User,
    Config,
    Approval
})

mongoose.connect(url, function (err) {
    console.log("connected to db")
});

mongoose.connection.on("error", function onError(err) {
    console.log("\nmongoose connection error: ", err, "\n");
    process.exit(1);
})
;