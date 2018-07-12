const router = require('express').Router();
const ObjectId = require('mongoose').Types.ObjectId;
const { txStatus } = require('../../lib/enum');
const {
    Asset,
    User,
    Transaction,
} = require('../../lib/db');
const auth = require("./../../lib/auth");

module.exports = router;

router
    .use(auth.bounceUnauthenticated)
    .get('/', auth.bounceNonAdmin, handleGetStats)
    .get('/users/:userId', auth.bounceUnauthorised({owner: true}), handleGetStatsByUser);

function handleGetStats(req, res, next) {
    let getRegistrationCount = User.count({ role: 'user' }).exec();

    let getNewOrdersCount = Transaction.count({
        status: {
            $in: [txStatus.AWAITING_PAYMENT, txStatus.PAYMENT_RECEIVED],
        },
        createdAt: {
            $gte: Date.now() - (60 * 60 * 24 * 30),
        },
    }).exec();

    let getTransactionsCount = Transaction.count({}).exec();

    let getCompletedTransactionCount = Transaction.count({ status: txStatus.COMPLETED }).exec();

    let getRecentOrders = Transaction.find({})
        .populate('user', ['firstName', 'lastName'])
        .populate('depositAsset')
        .populate('receiptAsset')
        .sort('-createdAt')
        .limit(5)
        .exec();

    let getTransactionSumByAsset = Transaction.aggregate([{
            $group: {
                _id: "$depositAssetCode",
                count: { $sum: '$depositAmount' }
            },
        },
        {
            $project: {
                code: '$_id',
                totalDeposit: '$count',
                _id: 0
            }
        }
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
            getTransactionSumByAsset
        ])
        .then(([regCount, txCount, completedTxCount, newOrderCount, recentOrders, transactionStats]) => {
            res._success({
                regCount,
                txCount,
                completedTxCount,
                newOrderCount,
                recentOrders,
                transactionStats
            })
        })
};

function handleGetStatsByUser(req, res) {
    let getTransactionSumByAsset = Transaction.aggregate([{
            $match: { user: ObjectId(req.params.userId) }
        },
        {
            $group: {
                _id: "$depositAssetCode",
                count: { $sum: '$depositAmount' }
            },
        },
        {
            $project: {
                code: '$_id',
                totalDeposit: '$count',
                _id: 0
            }
        }
    ]).exec();

    let getRecentOrders = Transaction.find({ user: req.params.userId })
        .populate(['depositAsset', 'receiptAsset'])
        .sort('-createdAt')
        .limit(5)
        .exec();

    Promise.all([
            getRecentOrders,
            getTransactionSumByAsset
        ])
        .then(([recentOrders, transactionStats]) => {
            res._success({
                recentOrders,
                transactionStats
            })
        })
}
