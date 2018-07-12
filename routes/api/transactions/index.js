const
    path = require('path'),
    router = require('express').Router(),
    serverUtils = require('../../../lib/utils'),
    auth = require(path.join(serverUtils.getRootDirectory(), 'lib/auth')),
    socketIoServer = require(path.join(serverUtils.getRootDirectory(), 'socketIoServer')),
    {
        Transaction,
        Asset,
        Config,
    } = require(path.join(serverUtils.getRootDirectory(), 'lib/db'));

const paystack = require('paystack')(process.env.PAYSTACK_API_KEY);
const enums = require('../../../lib/enum');

module.exports = router;
router
    .use(auth.bounceUnauthenticated)
    .post('/', handlePostTransaction)
    .get('/', handleGetTransactions)

    .param('userId', resolveUser)

    .get('/users/:_userId', auth.bounceUnauthorised({
        admin: true
    }), handleGetUserTransactions)
    .get('/recent', handleGetRecentTransactions)

    .param('_id', resolveTransaction)

    .get('/:_id', handleGetTransaction)
    .put('/:_id/status', auth.bounceUnauthorised({
        admin: true
    }), handlePutTransactionStatus)
    .put('/:_id/payment/verify', handleVerifyPaystack)
    .put('/:_id/receiptAddress', handleAddReceiptAddress);

function resolveTransaction(req, res, next, _id) {
    req._params = req._params || {};
    Transaction.findById(_id)
        .populate('depositAsset')
        .populate('receiptAsset')
        .populate('user', ['firstName', 'lastName', 'emailAddress'])
        .then((transaction) => {
            if (!transaction) {
                return res._sendError('item not found', new serverUtils.ErrorReport(404, {
                    _id: '_id not found',
                }));
            }
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
            return res._sendError('item not found', new serverUtils.ErrorReport(404, {
                _id: 'user not found',
            }));
        }
        req._params.user = user;
        return next();
    }).catch(err => next(err));
}


function handleGetTransaction(req, res) {
    res._success(req._params.transaction);
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
    transaction.save()
        .then((transaction) => {
            transaction.user.transactionCount++;
            return transaction.user.save();
        })
        .then(user => res._success(transaction))
        .catch(err => next(err));
}

function handleGetTransactions(req, res, next) {
    const {
        page = 1, pageSize = 20, status = null
    } = req.query;

    const query = req.user.role === 'admin' ? {} : {
        user: req.user._id
    };

    if (status) {
        query.status = status.toLowerCase();
    }

    const getTransactions = Transaction.find(query)
        .sort('-createdAt')
        .limit(Number(pageSize))
        .skip(Number((page - 1) * pageSize))
        .populate('receiptAsset', 'type')
        .populate('depositAsset', 'type')
        .populate('user', ['assetAccounts', 'firstName', 'lastName'])
        .exec();

    const countTransactions = Transaction.count(query);

    Promise.all([getTransactions, countTransactions])
        .then(([transactions, transactionCount]) => res._success({
            items: transactions,
            totalCount: transactionCount,
        }))
        .catch(err => next(err));
}

function handleGetUserTransactions(req, res, next) {
    const {
        page = 1, pageSize = 20, status = null
    } = req.query;

    const query = {
        user: req.user._id
    };

    if (status) {
        query.status = status.toLowerCase();
    }

    const getTransactions = Transaction.find(query)
        .sort('-createdAt')
        .limit(Number(pageSize))
        .skip(Number((page - 1) * pageSize))
        .populate('receiptAsset', 'type')
        .populate('depositAsset', 'type')
        .populate('user', ['assetAccounts', 'firstName', 'lastName'])
        .exec();

    const countTransactions = Transaction.count(query);

    Promise.all([getTransactions, countTransactions])
        .then(([transactions, transactionCount]) => res._success({
            items: transactions,
            totalCount: transactionCount,
        }))
        .catch(err => next(err));
}

function handleGetRecentTransactions(req, res, next) {

    const getTransactions = Transaction.find({})
        .sort('-createdAt')
        .limit(5)
        .populate('receiptAsset', 'type')
        .populate('depositAsset', 'type')
        .exec();

    getTransactions
        .then((transactions) => res._success(transactions))
        .catch(err => next(err));
}

function handleAddReceiptAddress(req, res, next) {
    if (!(req.body &&
            req.body.hasOwnProperty('receiptAddress'))) {
        return res._sendError('missing or invalid parameters',
            new serverUtils.ErrorReport({
                receiptAddress: 'receiptAddress not provided',
            }));
    }
    const {
        transaction
    } = req._params;
    const {
        receiptAddress
    } = req.body;

    transaction.receiptAddress = receiptAddress
    transaction.save()
        .then((_transaction) => {
            res._success({});
        })
        .catch(err => next(err));
}

function handlePutTransactionStatus(req, res, next) {
    if (!(req.body &&
            req.body.hasOwnProperty('status'))) {
        return res._sendError('missing or invalid parameters',
            new serverUtils.ErrorReport({
                status: 'status not provided',
            }));
    }
    const {
        transaction
    } = req._params;
    const {
        status
    } = req.body;
    const {
        _id
    } = req.params;

    transaction.status = status.toLowerCase();
    transaction.save()
        .then((_transaction) => {
            res._success(status);
            socketIoServer.in(_id).emit('status', status);
        })
        .catch(err => next(err));
}

async function handleVerifyPaystack(req, res, next) {
    try {
        const {
            transaction
        } = req._params;

        paystack.transaction
            .verify(transaction._id, async function (error, body) {
                if (error) {
                    throw error;
                }
                if (body.status &&
                    body.data.status === 'success' &&
                    transaction.depositAmount <= body.data.amount / 100) {

                    transaction.status = enums.txStatus.PAYMENT_RECEIVED;
                    await transaction.save();

                    res._success({});
                } else {
                    res._sendError('Payment not verified',
                        new serverUtils.ErrorReport({
                            status: 'Payment not verified',
                        }));
                }
            });
    } catch (error) {
        console.log(error);
    }
}
