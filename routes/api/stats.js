const router = require('express').Router();
const {
    Asset,
    User,
    Transaction,
} = require('../../lib/db');

module.exports = router;

router
    .get('/', handleGetStats);

async function handleGetStats(req, res, next) {
    let userRegistrations = User.count({}).exec();
    let newOrders = Transaction.count({
        status: {
            $in: ['awaiting payment', 'payment received'],
        },
        createdAt: {
            $gte: Date.now() - (60 * 60 * 24 * 30),
        },
    }).exec();
    let transactionsCount = Transaction.count({}).exec();
    let completedTransactionCount = Transaction.count({
        status: 'completed',
    }).exec();
    let newestOrders = Transaction.find({}).sort('-createdAt').limit(5).exec();
    let assets = await Asset.find({}).exec();
    Promise.all([Promise.all([
        userRegistrations, newOrders, newestOrders, transactionsCount, completedTransactionCount,
    ]), Promise.all(assets.map(asset =>
        Transaction.aggregate([{
            $match: {
                depositAssetCode: asset.code,
            },
        }, {
            $group: {
                _id: asset.code,
                count: {
                    $sum: '$depositAmount',
                }
            }
        }]).exec()
    ))]).then(result => {
        console.log(require('util').inspect(result, {
            depth: null,
            colors: true
        }));
        [userRegistrations, newOrders, newestOrders, transactionsCount, completedTransactionCount] = result[0];
        assetStats = result[1];
        let saleStats = (completedTransactionCount / transactionsCount ) * 100;
        res._success({userRegistrations, newOrders, newestOrders, saleStats})
    })
};
