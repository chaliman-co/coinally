const path = require('path'),
  router = require('express').Router(),
  serverUtils = require('../../../lib/utils'),
  {
    Transaction,
    Asset,
    Config
  } = require(path.join(serverUtils.getRootDirectory(), 'lib/db'));

socketIoServer = require(path.join(serverUtils.getRootDirectory(), 'socketIoServer'));

module.exports = router;

router
  .get('/', handleGetTransactions)
  .post('/', handlePostTransaction)
  .param('_id', resolveTransaction)
  .put('/:_id/status', handlePutTransactionStatus);

function resolveTransaction(req, res, next, _id) {
  Transaction.findById(_id).then((transaction) => {
    if (!transaction) return res._sendError("item not found", new serverUtils.ErrorReport({
      _id: "_id not found"
    }));
    req._params = req._params || {};
    req._params.transaction = transaction;
    next();
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
  const transaction = new Transaction(transactionDetails);
  transaction.save().then(
    (transaction) => {
      transaction.user.transactionCount++;
      transaction.user.save().then(
        user => res.json(transaction), err => next(err)
      )
    },
    (err) => {
      return next(err);
    },
  );
}

function handleGetTransactions(req, res, next) {
  const {
    skip = 0, limit = 20, ...rest
  } = req.query;
  Transaction.find(rest)
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
  transaction.status = status;
  transaction.save().then((_transaction) => {
    res._success(status);
    socketIoServer.in(_id).emit("status", status)
  }, (err) => {
    return next(err)
  });
}