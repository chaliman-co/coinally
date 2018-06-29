const
    mongoose = require('mongoose'),
    url = "mongodb://chalu:89575684gA.@ds247410.mlab.com:47410/coinally",
    // url = 'mongodb://127.0.0.1',
    Asset = require('./models/Asset'),
    Transaction = require('./models/Transaction'),
    User = require('./models/User'),
    Config = require('./models/Config'),
    Approval = require('./models/Approval');

Object.assign(exports, {
    connection: mongoose.connection,
    connect: mongoose.connect,
    url,
    Asset,
    Transaction,
    User,
    Config,
    Approval,
});

mongoose.connect(url, (err) => {
    console.log("connected to db")
});

mongoose.connection.on('error', (err) => {
    console.log("\nmongoose connection error: ", err, "\n");
    process.exit(1);
});

