const router = require('express').Router();
const { ObjectId } = require('mongoose').Types;
const { txStatus } = require('../../lib/enum');
const { User, Transaction } = require('../../lib/db');
const auth = require('./../../lib/auth');

function handleGetStats(req, res) {
    const getRegistrationCount = User.count({ role: 'user' }).exec();

    const getNewOrdersCount = Transaction.count({
        status: {
            $in: [txStatus.AWAITING_PAYMENT, txStatus.PAYMENT_RECEIVED],
        },
        createdAt: {
            $gte: Date.now() - (60 * 60 * 24 * 30),
        },
    }).exec();

    const getTransactionsCount = Transaction.count({}).exec();

    const getCompletedTransactionCount = Transaction.count({ status: txStatus.COMPLETED }).exec();

    const getRecentOrders = Transaction.find({})
        .populate('user', ['firstName', 'lastName'])
        .populate('depositAsset')
        .populate('receiptAsset')
        .sort('-createdAt')
        .limit(5)
        .exec();

    const getTransactionSumByAsset = Transaction.aggregate([{
            $group: {
                _id: '$depositAssetCode',
                count: { $sum: '$depositAmount' },
            },
        },
        {
            $project: {
                code: '$_id',
                totalDeposit: '$count',
                _id: 0,
            },
        },
        // {
        //     $lookup: {
        //         from: 'assets',
        //         localField: '_id',
        //         foreignField: '_id',
        //         as: 'asset'
        //     }
        // }
    ]).exec();

    Promise.all([
            getRegistrationCount,
            getTransactionsCount,
            getCompletedTransactionCount,
            getNewOrdersCount,
            getRecentOrders,
            getTransactionSumByAsset,
        ])
        .then(([
            regCount,
            txCount,
            completedTxCount,
            newOrderCount,
            recentOrders,
            transactionStats,
        ]) => {
            res._success({
                regCount,
                txCount,
                completedTxCount,
                newOrderCount,
                recentOrders,
                transactionStats,
            });
        });
}

function handleGetStatsByUser(req, res) {
    const getTransactionSumByAsset = Transaction.aggregate([{
            $match: { user: ObjectId(req.params.userId) },
        },
        {
            $group: {
                _id: '$depositAssetCode',
                count: { $sum: '$depositAmount' },
            },
        },
        {
            $project: {
                code: '$_id',
                totalDeposit: '$count',
                _id: 0,
            },
        },
    ]).exec();

    const getRecentOrders = Transaction.find({ user: req.params.userId })
        .populate(['depositAsset', 'receiptAsset'])
        .sort('-createdAt')
        .limit(5)
        .exec();

    Promise.all([
            getRecentOrders,
            getTransactionSumByAsset,
        ])
        .then(([recentOrders, transactionStats]) => {
            res._success({
                recentOrders,
                transactionStats,
            });
        });
}


router
    .use(auth.bounceUnauthenticated)
    .get('/', auth.bounceNonAdmin, handleGetStats)
    .get('/users/:userId', auth.bounceUnauthorised({ owner: true }), handleGetStatsByUser);

module.exports = router;
