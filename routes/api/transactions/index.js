const
    path = require('path'),
    router = require('express').Router(),
    serverUtils = require('../../../lib/utils'),
    auth = require(path.join(serverUtils.getRootDirectory(), 'lib/auth')),
    socketIoServer = require(path.join(serverUtils.getRootDirectory(), 'socketIoServer')),
    {
        Transaction,
        Asset,
        Config
    } = require(path.join(serverUtils.getRootDirectory(), 'lib/db'));


module.exports = router;
router
    .use(auth.bounceUnauthenticated)
    .post('/', handlePostTransaction)
    .get('/', handleGetTransactions)

.param('userid', resolveUser)

.get('/users/:_userid', auth.bounceUnauthorised({ admin: true }), handleGetUserTransactions)

.param('_id', resolveTransaction)

//.get('/:_id', auth.bounceUnauthorised({ admin: true, owner: true }),  handleGetTransaction)
.put('/:_id/status', auth.bounceUnauthorised({ admin: true }), handlePutTransactionStatus);

function resolveTransaction(req, res, next, _id) {
    req._params = req._params || {};
    Transaction.findById(_id).then((transaction) => {
        if (!transaction) return res._sendError("item not found", new serverUtils.ErrorReport({
            _id: "_id not found"
        }));
        req._params.transaction = transaction;
        next();
    });
}

function resolveUser(req, res, next, _id) {
    req._params = req._params || {};
    if (req.user._id == _id) {
        req._params.user = req.user;
        return next();
    } // In case it's the admin or another user
    User.findOne({
        _id,
    }).populate('assetAccounts.asset', 'addressType').then((user) => {
        if (!user) {
            return res._sendError("item not found", new serverUtils.ErrorReport(404, {
                _id: "user not found"
            }));
        }
        req._params.user = user;
        return next();
    }).catch(err => next(err));
}

function handleGetTransaction(req, res, next) {
    Transaction.findById(req.params._id)
        .populate('receiptAsset')
        .populate('depositAsset')
        .exec()
        .then(transaction => {
            if (!transaction) {
                return res._sendError("item not found", new serverUtils.ErrorReport({
                    _id: "_id not found"
                }));
            }

            res._success(transaction);
        })
        .catch(err => {
            res._sendError("An unexpected error occured", err);
        });
}

function handlePostTransaction(req, res, next) {
    const transactionDetails = new Transaction.Fields(),
        rawInput = req.body;
    try {
        serverUtils.deepAssign(transactionDetails, rawInput);
    } catch (err) {
        const unknownField = err.message.match(/property (.+),/)[1];
        return res._sendError(
            'unknown field',
            new serverUtils.ErrorReport(400, {
                [unknownField]: `${unknownField} not recognized`,
            }),
        );
    }
    transactionDetails.user = req.user._id;
    const transaction = new Transaction(transactionDetails);
    transaction.save().then(
        (transaction) => {
            transaction.user.transactionCount++;
            transaction.user.save().then(
                user => res._success(transaction), err => next(err)
            )
        },
        (err) => {
            return next(err);
        },
    );
}

function handleGetTransactions(req, res, next) {
    const {
        skip = 0, limit = 20,
    } = req.query;
    Transaction.find(req.user.role == 'admin' ? {} : { user: req.user._id })
        .sort('-createdAt')
        .limit(Number(limit))
        .skip(Number(skip))
        .populate('receiptAsset', 'type')
        .populate('depositAsset', 'type')
        .populate('user', ['assetAccounts', 'firstName', 'lastName'])
        .exec()
        .then(
            (transactions) => {
                if (!transactions.length)
                    return res._sendError(
                        "No matching documents",
                        new serverUtils.ErrorReport(404, {
                            transactions: "no transactions found"
                        })
                    );
                return res._success(transactions);
            },
            (err) => {
                return next(err);
            },
        );
}

function handleGetUserTransactions(req, res, next) {
    const {
        skip = 0, limit = 20,
    } = req.query;
    Transaction.find({ user: req._params.user._id })
        .sort('-createdAt')
        .limit(Number(limit))
        .skip(Number(skip))
        .populate('receiptAsset', 'type')
        .populate('depositAsset', 'type')
        .populate('user', ['assetAccounts', 'firstName', 'lastName'])
        .exec()
        .then(
            (transactions) => {
                if (!transactions.length)
                    return res._sendError(
                        "No matching documents",
                        new serverUtils.ErrorReport(404, {
                            transactions: "no transactions found"
                        })
                    );
                return res._success(transactions);
            },
            (err) => {
                return next(err);
            },
        );
}

function handlePutTransactionStatus(req, res, next) {
    if (!(req.body && req.body.hasOwnProperty('status'))) return res._sendError('missing or invalid parameters', new serverUtils.ErrorReport({
        status: 'status not provided'
    }));
    const {
        transaction
    } = req._params, {
        status
    } = req.body, {
        _id
    } = req.params;
    transaction.status = status.toLowerCase();
    transaction.save().then((_transaction) => {
        res._success(status);
        socketIoServer.in(_id).emit("status", status)
    }, (err) => {
        return next(err)
    });
}