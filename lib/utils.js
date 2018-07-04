const
  jwt = require('jsonwebtoken'),
  db = require('./db'),
  // auth = require("./auth"),
  emailer = require('./emailer'),
  uuid = require('uuid/v4'),
  serverConfig = require('./config'),
  adminConfig = db.Config,
  mongoose = require('mongoose');

function extend(server) {
  server.once('request', (req, res) => {
    let resProto = res.constructor.prototype;
    resProto._sendError = function _sendError(summary, errorReport) {
      this.status((errorReport.statusCode) || 500);
      this.json({
        status: "failed",
        reason: summary,
        errors: errorReport,
      })
    }
    resProto._success = function _success(result = {}) {
      this.status(result.statusCode || 200);
      this.json({
        status: "success",
        result
      })
    }
  });
}

function _404ErrorHandler(req, res, next) {
  if (!res.finished) {
    return res._sendError("item not found", new ErrorReport(404, {
      url: "resource not found"
    }));
  }
  next();
}

function serverErrorHandler(err, req, res, next) {
  console.log(`internal error: ${err}`);
  if (err.errorReport) {
    if (!res.finished) return res._sendError('intenal server error', err.errorReport);
  }
  next(err);
}

function getAuthToken(user) {
  const authToken = jwt.sign({
    emailAddress: user.emailAddress,
    _id: user._id,
  }, serverConfig.TOKEN_SECRET, {
    expiresIn: '1h',
  });
  return authToken;
}

function ErrorReport(statusCode, errorDetails) {
  if (!errorDetails) {
    [errorDetails, statusCode] = [statusCode, 400];
  }
  deepAssign(this, {
    statusCode,
    errorDetails,
  });
}

function ServerError(statusCode, reportMessage, err) {
  if (!err) {
    [err, reportMessage] = [reportMessage, undefined];
  }
  if (!err) {
    [err, statusCode] = [statusCode, 500];
  }
  if (!(reportMessage === 'none')) {
    const errorReport = new ErrorReport(statusCode, {
      server: reportMessage || 'Internal server error',
    });
    err.errorReport = errorReport;
  }
  return err;
}

function isObject(obj) {
  return typeof obj === 'object' && !Array.isArray(obj);
}

function deepAssign(obj, ...sources) {
  if (!sources.length) return obj;
  for (const source of sources) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!obj[key]) {
          Object.assign(obj, {
            [key]: {},
          });
        }
        deepAssign(obj[key], source[key]);
      } else {
        Object.assign(obj, {
          [key]: source[key],
        });
      }
    }
  }
  return obj;
}

function removeFrom(obj, testValue) {
  for (prop in obj) {
    const value = obj[prop];
    if (typeof (value) === 'object') removeFrom(value, testValue);
    else if (value == testValue) delete obj[prop];
  }
}

function VerificationEmail({
  firstName,
  code,
  duration,
} = {}) {
  this.html = `<h1> Hi ${firstName} <br> your verification code is ${code.value}. It will remain valid for ${duration}.`;
  this.subject = 'coinally Verification code';
}

function ConfirmationEmail({
  update,
  firstName,
  duration,
}) {
  const confirmationLink = new confirmationLink(update.code);
  this.html = `<h1> Hi ${firstName} <br> you have requested to change your${update.field} to ${update.value}.
    Click on this link to confirm this change: ${confirmationLink}.   It will remain valid for ${duration}.`;
  this.subject = 'Coinally Verification Link';
}

function confirmationLink(code) {
  return `http://${serverConfig.HOSTNAME}/confirmation/${code}`;
}

function genVerificationCode() {
  return {
    // value: uuid(null, new Buffer(15)).toString('base64').substring(0, 15)
    value: Math.floor(100000 + (Math.random() * 900000)),
    expiresIn: (() => {
      const time = new Date();
      return time.setHours(time.getHours() + adminConfig.get('VERIFICATION_CODE_VALIDITY'));
    })(),
  };
}

function sendConfirmationLink(user, update, cb) {
  let
    receiptEmailAddress = update.field == 'emailAddress' ? update.value : user.emailAddress,
    duration = `${parseFloat(adminConfig["VERIFICATION_CODE_VALIDITY"] * 60)  }minutes`,
    mailContent = new ConfirmationEmail({
      update,
      firstName: user.firstName,
      duration,
    });
  emailer.sendMail(emailAddress, mailContent, (err) => {
    if (err) return cb(err);
    return cb(null, code)
  });
}

function sendAuthCode(user, cb) {
  const {
    emailAddress,
    firstName,
  } = user,
  duration = `${parseFloat(adminConfig.get("VERIFICATION_CODE_VALIDITY") * 60)  }minutes`,
    code = user.verificationCode;
  mailContent = new VerificationEmail({
    code,
    firstName,
    duration,
  });
  emailer.sendMail(emailAddress, mailContent, (err) => {
    if (err) return cb(err);
    return cb(null, code)
  });
}

function dbErrorHandler(err, req, res, next) {
  const errorDetails = {};
  if (err.name == 'ObjectParameterError') {
    const violatedField = err.message.match(/\"(.*)\"/)[1];
    return res._sendError('Invalid and/or missing parameters', {
      [violatedField]: `${violatedField} invalid`,
    });
  }
  if (err.name == 'CastError') {
    console.log('\ncast error: ', err);
    const
      field = err.path
    // model = err.model.modelName
    ;
    return res._sendError('item not found', new ErrorReport(404, {
      [field]: `${field} not found`,
    }));
  }
  if (err instanceof mongoose.Error.ValidationError) {
    for (errorName in err.errors) {
      const error = err.errors[errorName];
      const errorMessage = error.message;
      if (error.name == 'CastError') {
        const
          field = error.path;
        errorDetails[field] = `${field} invalid`;
        continue;
      }
      if (/^updates\./.test(errorName)) {
        Object.assign(errorDetails, JSON.parse(errorMessage));
      } else errorDetails[errorName] = errorMessage;
    }
    return res._sendError('Invalid and/or missing parameters', new ErrorReport(errorDetails));
  }
  if (err.code === 11000) { /*duplicate value for unique field */
    const violatedField = err.message.match(/index: .*\$(.*)_1/)[1];
    errorDetails[violatedField] = `${violatedField} already taken`;
    return res._sendError('item already exists', new ErrorReport(409, errorDetails));
  }
  if (err.name === 'MongoError' || err.name === 'MongoNetworkError') {
    if (db.connection.readyState === 0) {
      db.connect(db.url);
      console.log('\n\n told db to reconnect');
    }
    return next(new ServerError(err));
  }
  return next(err);
}

function getRootDirectory() {
  return /(.+)[\/\\].*\.js/.exec(require.main.filename)[1];
}

function getPublicDirectory() {
  return `${getRootDirectory()  }/public`;
}


module.exports = {
  extend,
  ErrorReport,
  getAuthToken,
  ServerError,
  serverErrorHandler,
  deepAssign,
  sendAuthCode,
  getRootDirectory,
  genVerificationCode,
  getPublicDirectory,
  dbErrorHandler,
  _404ErrorHandler,
};
