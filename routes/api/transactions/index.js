const router = require('express').Router();
const serverUtils = require('../../../lib/utils');

const auth = require('../../../lib/auth');
const socketIoServer = require('../../../socketIoServer');
const { Transaction, User } = require('../../../lib/db');

const paystack = require('paystack')(process.env.PAYSTACK_API_KEY);
const { txStatus } = require('../../../lib/enum');
const emailer = require('../../../lib/emailer');


function resolveTransaction(req, res, next, _id) {
    req._params = req._params || {};
    Transaction.findById(_id)
        .populate('depositAsset')
        .populate('receiptAsset')
        .populate('user', ['firstName', 'lastName', 'emailAddress'])
        .then((transaction) => {
            if (!transaction) {
                res._sendError('item not found', new serverUtils.ErrorReport(404, {
                    _id: '_id not found',
                }));
            } else {
                req._params.transaction = transaction;
                next();
            }
        });
}

function resolveUser(req, res, next, _id) {
    req._params = req._params || {};
    if (req.user._id === _id) {
        req._params.user = req.user;
        next();
    } else { // In case it's the admin or another user
        User.findOne({
            _id,
        }).populate('assetAccounts.asset', 'addressType').then((user) => {
            if (!user) {
                res._sendError('item not found', new serverUtils.ErrorReport(404, {
                    _id: 'user not found',
                }));
            } else {
                req._params.user = user;
                next();
            }
        }).catch(err => next(err));
    }
}


function handleGetTransaction(req, res) {
    res._success(req._params.transaction);
}

function handlePostTransaction(req, res, next) {
    const transactionDetails = new Transaction.Fields();
    const rawInput = req.body;

    try {
        serverUtils.deepAssign(transactionDetails, rawInput);
        transactionDetails.user = req.user._id;
        let transaction = new Transaction(transactionDetails);
        transaction.save()
            .then((savedTx) => {
                transaction = savedTx;
                transaction
                    .user.transactionCount++;
                return transaction.user.save();
            })
            .then(() => {
                emailer
                    .sendOnNewTransaction(transaction.user, transaction);
                res._success(transaction);
            })
            .catch((err) => {
                next(err);
            });
    } catch (err) {
        const unknownField = err.message.match(/property (.+),/)[1];
        const error = new serverUtils.ErrorReport(400, {
            [unknownField]: `${unknownField} not recognized`,
        });
        res._sendError('unknown field', error);
    }
}

function handleGetTransactions(req, res, next) {
    const {
        page = 1, pageSize = 20, status = null,
    } = req.query;

    const query = req.user.role === 'admin' ? {} : {
        user: req.user._id,
    };

    if (status) {
        query.status = status.toLowerCase();
    }

    const getTransactions = Transaction.find(query)
        .sort('-createdAt')
        .limit(Number(pageSize))
        .skip(Number((page - 1) * pageSize))
        .populate('receiptAsset', ['type', 'name', 'imagePath'])
        .populate('depositAsset', ['type', 'name', 'imagePath'])
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
        page = 1, pageSize = 20, status = null,
    } = req.query;

    const query = {
        user: req.params._userId,
    };

    if (status) {
        query.status = status.toLowerCase();
    }

    const getTransactions = Transaction.find(query)
        .sort('-createdAt')
        .limit(Number(pageSize))
        .skip(Number((page - 1) * pageSize))
        .populate('receiptAsset', ['type', 'name', 'imagePath'])
        .populate('depositAsset', ['type', 'name', 'imagePath'])
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
        .then(transactions => res._success(transactions))
        .catch(err => next(err));
}

function handleAddReceiptAddress(req, res, next) {
    const { transaction } = req._params;
    const { receiptAddress } = req.body;

    if (!receiptAddress) {
        const error = new serverUtils.ErrorReport({
            receiptAddress: 'receiptAddress not provided',
        });
        res._sendError('missing or invalid parameters', error);
    } else {
        transaction.receiptAddress = receiptAddress;
        transaction.save()
            .then(() => {
                res._success({});
            })
            .catch(err => next(err));
    }
}

function handlePutTransactionStatus(req, res, next) {
    const { transaction } = req._params;
    const { status } = req.body;
    const { _id } = req.params;

    if (!status) {
        const error = new serverUtils.ErrorReport({
            status: 'status not provided',
        });
        res._sendError('missing or invalid parameters', error);
    } else {
        transaction.status = status.toLowerCase();
        transaction.save()
            .then(() => {
                res._success(status);
                emailer.sendOnTransactionStatusChange(transaction);
                socketIoServer.in(_id).emit('status', status);
            })
            .catch(err => next(err));
    }
}

function verifyPayment(txId) {
    return new Promise((resolve, reject) => {
        paystack.transaction
            .verify(txId, (err, response) => {
                if (!err) {
                    resolve(response);
                } else {
                    reject(err);
                }
            });
    });
}

function handleVerifyPaystack(req, res) {
    const { transaction } = req._params;

    verifyPayment(transaction._id)
        .then((body) => {
            if (body.status &&
                body.data.status === 'success' &&
                transaction.depositAmount <= body.data.amount / 100) {
                transaction.status = txStatus.PAYMENT_RECEIVED;
                return transaction.save();
            }
            throw new Error('Payment not verified');
        })
        .then(() => {
            res._success({});
            emailer.sendOnTransactionStatusChange(transaction);
        })
        .catch((error) => {
            error = new serverUtils.ErrorReport({
                status: error.message,
            });
            res._sendError(error.message, error);
        });
}


router
    .use(auth.bounceUnauthenticated)
    .post('/', handlePostTransaction)
    .get('/', handleGetTransactions)
    .param('userId', resolveUser)
    .get('/users/:_userId', auth.bounceUnauthorised({
        admin: true,
    }), handleGetUserTransactions)
    .get('/recent', handleGetRecentTransactions)
    .param('_id', resolveTransaction)
    .get('/:_id', handleGetTransaction)
    .put('/:_id/status', auth.bounceUnauthorised({
        admin: true,
    }), handlePutTransactionStatus)
    .put('/:_id/payment/verify', handleVerifyPaystack)
    .put('/:_id/receiptAddress', handleAddReceiptAddress);

module.exports = router;
