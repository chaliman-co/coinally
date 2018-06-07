const path = require("path"),
  router = require("express").Router(),
  serverUtils = require("../../../lib/utils"),
  { Transaction, Asset, Config } = require(path.join(serverUtils.getRootDirectory(), "lib/db"));
  socketIoServer = require(path.join(serverUtils.getRootDirectory(), "socketIoServer"))

module.exports = router;

router
  .get("/", handleGetTransactions)
  .post("/", handlePostTransaction)
  .param("_id", resolveTransaction)
  .put("/:_id/status", handlePutTransactionStatus);

function resolveTransaction(req, res, next, _id) {
  Transaction.findById(_id).then(function foundTransaction(transaction) {
    if (!transaction) return res._sendError("item not found", new serverUtils.ErrorReport({ _id: "_id not found" }));
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
    let unknownField = err.message.match(/property (.+),/)[1];
    return res._sendError(
      "unknown field",
      new serverUtils.ErrorReport(400, {
        [unknownField]: `${unknownField} not recognized`
      })
    );
  }
  let transaction = new Transaction(transactionDetails);
  let err = transaction.validateSync();
  if (err) {
    return next(err);
  }
  const deposit2DollarRate = Asset.convertToDollars(
      transaction.depositAssetCode
    ),
    receipt2DollarRate = Asset.convertToDollars(transaction.receiptAssetCode),
    salesProfit = Config.get("SALES_PROFIT"), //in USD
    buyingProfit = Config.get("BUYING_PROFIT"),
    dollar2ReceiptRate = 1 / receipt2DollarRate;
  let paddedRate, deposit2ReceiptRate;
  if (transaction.depositAssetCode === "naira") {
    paddedRate = from2DollarRate - buyingProfit;
    deposit2ReceiptRate = paddedRate * dollar2ReceiptRate;
  } else {
    paddedRate = deposit2DollarRate - salesProfit;
    if (transaction.receiptAssetCode !== "naira") {
      paddedRate -= buyingProfit;
    }
    deposit2ReceiptRate = paddedRate * dollar2ReceiptRate;
  }
  transaction.save().then(
    function savedAsset(asset) {
      return res.json(asset);
    },
    function failedToSave(err) {
      return next(err);
    }
  );
}

function handleGetTransactions(req, res, next) {
    const
        { skip = 0, limit = 20, ...rest } = req.query
    ;
  Transaction.find(rest)
    .limit(limit)
    .skip(skip)
    .exec()
    .then(
      function foundTransactions(transactions) {
        if (!transactions.length)
          return res._sendError(
            "No matching documents",
            new serverUtils.ErrorReport(404, { transactions: "no transactions found" })
          );
        return res._success(transactions);
      },
      function failedToFind(err) {
        return next(err);
      }
    );
}

function handlePutTransactionStatus(req, res, next) {
    if (!(req.body && req.body.hasOwnProperty("status"))) return res._sendError("missing or invalid parameters", new serverUtils.ErrorReport({ status: "status not provided" }));
    const
        { transaction } = req._params,
        { status } = req.body,
        { _id } = req.params
    ;
    transaction.status = status;
    transaction.save().then(function sendResponse(_transaction) {
      res._success(status);
      socketIoServer.in(_id).emit("status", status)
    }, function handleSaveError(err) {
        return next(err)
    })
}