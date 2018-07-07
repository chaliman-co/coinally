const http = require('http');
require('dotenv').config();
const express = require('express');
const path = require('path');
const util = require('util');
const logger = require('morgan');
const bodyParser = require('body-parser');
const db = require('./lib/db');
const socketIoServer = require('./socketIoServer');
const serverUtils = require('./lib/utils');
const indexRoute = require('./routes/index');
const apiRoute = require('./routes/api');
const cors = require('cors');

const app = express();


app
    .use(logger('dev'))
    .use((req, res, next) => {
        res.setHeader('Access-Control-Allow-Origin', '*');
        next();
    })
    .use(cors())
    .options(/.*/, (req, res) => {
        res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
        res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        res.end();
    })
    .use(bodyParser.json())
    .use(express.static(path.join(__dirname, 'public')))
    .use('/api', apiRoute)
    .use(indexRoute);

const server = http.createServer(app);
serverUtils.extend(server);
socketIoServer.attach(server, {
    serveClient: false,
});


db.Config.getLive(() => {
    db.Asset.getLive(() => {
        server.listen(process.env.PORT || Number(process.argv[2]) || 8000, () => {
            console.log(`server listening on ${util.inspect(server.address(), { colors: true, depth: null })}`);
        });
    });
});