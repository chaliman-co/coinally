const
    http = require("http"),
    express = require('express'),
    path = require('path'),
    util = require("util"),
    logger = require('morgan'),
    bodyParser = require("body-parser"),
    db = require("./lib/db"),
    socketIoServer = require("./socketIoServer"),
    serverUtils = require("./lib/utils"),
    indexRoute = require('./routes/index'),
    apiRoute = require('./routes/api'),
    cors = require('cors'),
    app = express()
;

app
    .use(logger('dev'))
    .use(function (req, res, next) {console.log(req.headers)
        res.setHeader("Access-Control-Allow-Origin", "*");
        next()
    })
    .use(cors())
    .options(/.*/, function (req, res, next) {
        res.setHeader("Access-Control-Allow-Origin", req.headers["origin"]);
        res.setHeader("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE, OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type");
        res.end()
    })
    .use(bodyParser.json())
    .use(express.static(path.join(__dirname, 'public')))
    .use('/api', apiRoute)
    .use(indexRoute)

const server = http.createServer(app);
serverUtils.extend(server);
socketIoServer.attach(server, {
    serveClient: false
})


db.Config.getLive(function () {
    db.Asset.getLive(function () {
        server.listen(process.env.PORT || Number(process.argv[2]) || 8000, function () {
            console.log(`server listening on ${util.inspect(server.address(), { colors: true, depth: null })}`)
        })

    });
});
