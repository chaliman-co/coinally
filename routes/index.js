var express = require('express');
const serverUtils = require('../lib/utils');
const path = require('path');
var router = express.Router();

/* GET users listing. */
router.get('*', function(req, res, next) {
    return res.sendFile(path.join(serverUtils.getPublicDirectory(), 'index.html'))
});

module.exports = router;
