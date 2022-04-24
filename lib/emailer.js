const
    nodemailer = require('nodemailer'),
    fs = require("fs"),
    serverConfig = require('./config'),
    EMAIL_ADDRESS = process.env.ADMIN_EMAIL,
    EMAIL_PASSWORD = process.env.EMAIL_PASSWORD,
    EMAIL_SERVICE = process.env.EMAIL_SERVICE,
    transporter = nodemailer.createTransport({
        service: EMAIL_SERVICE,
        auth: {
            user: EMAIL_ADDRESS,
            pass: EMAIL_PASSWORD,
        },tls: {
            rejectUnauthorized: false
        }
    });
const sendMail = function (address, payload, cb, options= {}) {
    const mailOptions = {
        from: EMAIL_ADDRESS,
        to: address,
        cc: options.cc,
        subject: payload.subject,
        html: payload.body,
    };
    transporter.sendMail(mailOptions, cb);
};

function sendAuthCode(user, code, cb) {
    sendMail(user.emailAddress, loginTemplate.render({ code, h: adminConfig.get('VERIFICATION_CODE_VALIDITY'), name: user.firstName }),  cb);
} 

class EmailTemplate {
    constructor(template, subject) {
        this.template = template.toString("utf8");
        this.subject = subject;
    }
    render(variables) {
        let body = this.template;
        for (const varName of Object.getOwnPropertyNames(variables)) {
            body = body.replace(new RegExp(`%${varName}%`, "m"), variables[varName]);
        }
        return {subject: this.subject, body};
    }
}
const loginTemplate = new EmailTemplate(fs.readFileSync("./lib/email_templates/login.html"), "Login Verification")
const newTransactionTemplate = new EmailTemplate(fs.readFileSync("./lib/email_templates/tx_new.html"), "Your Transaction Has Been Created")
const failedTransactionTemplate = new EmailTemplate(fs.readFileSync("./lib/email_templates/tx_failed.html"), "Your Transaction Has Been Aborted")
const completedTransactionTemplate = new EmailTemplate(fs.readFileSync("./lib/email_templates/tx_completed.html"), "Your Transaction Has Been Completed")
const payedTransactionTemplate = new EmailTemplate(fs.readFileSync("./lib/email_templates/tx_payed.html"), "Your Payment has been received")
const sendgrid = require('@sendgrid/mail');
const { txStatus } = require('./enum');
const util = require("util");

const adminConfig = require("../lib/db").Config;
/**
 * Send email
 * @param {Object | Array} to
 * @param {Object} substitutions
 * @param {String} templateId
 * @param {Object} options
 * @param {Function} cb
 */
// function sendMail(to, substitutions = {}, templateId, options = {}, cb) {
//     substitutions = substitutions || {};
//     options = options || {};
//     sendgrid.setApiKey(process.env.SENDGRID_API_KEY);
//     sendgrid.setSubstitutionWrappers('%', '%');

//     const users = Array.isArray(to) ? to : [to];

//     const msg = {
//         to: users.map((u) => {
//             u = {
//                 name: u.firstName,
//                 email: u.emailAddress,
//             };
//             return u;
//         }),
//         from: {
//             email: process.env.FROM_EMAIL,
//             name: process.env.FROM_NAME,
//         },
//         dynamic_template_data: {
//             ...substitutions,
//             name: to.firstName,
//         },
//         template_id: templateId,
//         ...options,
//     };

//     sendgrid.send(msg)
//         .then(() => {
//             if (cb) {
//                 cb(null);
//             }console.log(util.inspect({msg}, {depth: null}))
//         })
//         .catch((error) => {
//             if (cb) {
//                 cb(error, null);
//             }
//             console.log({ sendgridError: error.message });
//         });
// }

// function sendAuthCode(user, code, cb) {
//     sendMail(user, { code, h: adminConfig.get('VERIFICATION_CODE_VALIDITY') }, process.env.LOGIN_TEMPLATE, null, cb);
// }

function sendOnUserAction(user, item, cb) {
    const substitutions = {
        user: `${user.firstName} ${user.lastName}`,
        id: user._id,
        item,
    };

    const admin = {
        firstName: 'Admin',
        emailAddress: process.env.ADMIN_EMAIL,
    };

    sendMail(admin, substitutions, process.env.USER_ACTION_TEMPLATE, null, cb);
}

function sendOnNewAccount(user, cb) {
    sendOnUserAction(user, 'bank account', cb);
}

function sendOnVerificationDetail(user, cb) {
    sendOnUserAction(user, 'verification detail', cb);
}

function sendOnTransaction(user, tx, template, cb) {
    const substitutions = {
        transaction: tx._id,
        name: user.firstName,
        amount: `${tx.depositAmount.toLocaleString('en-US', { maximumFractionDigits: 6 })} 
        ${tx.depositAssetCode.toUpperCase()}`,
    };

    const options = {
        cc: process.env.ADMIN_EMAIL,
    };

    sendMail(user.emailAddress, template.render(substitutions), cb, options);
}

function sendOnNewTransaction(user, tx, cb) {
    sendOnTransaction(user, tx, newTransactionTemplate, cb);
}

function sendOnFailedTransaction(user, tx, cb) {
    sendOnTransaction(user, tx, failedTransactionTemplate, cb);
}

function sendOnCompleteTransaction(user, tx, cb) {
    sendOnTransaction(user, tx, completedTransactionTemplate, cb);
}

function sendOnPayedTransaction(user, tx, cb) {
    sendOnTransaction(user, tx, payedTransactionTemplate, cb);
}

function sendOnTransactionStatusChange(transaction, cb) {
    switch (transaction.status) {
        case txStatus.COMPLETED:
            sendOnCompleteTransaction(transaction.user, transaction, cb);
            break;
        case txStatus.FAILED:
            sendOnFailedTransaction(transaction.user, transaction, cb);
            break;
        case txStatus.PAYMENT_RECEIVED:
            sendOnPayedTransaction(transaction.user, transaction, cb);
            break;
        default:
            break;
    }
}

module.exports = {
    sendMail,
    sendAuthCode,
    sendOnNewAccount,
    sendOnVerificationDetail,
    sendOnNewTransaction,
    sendOnFailedTransaction,
    sendOnCompleteTransaction,
    sendOnPayedTransaction,
    sendOnTransactionStatusChange,
};
const request1 = {
    url: `/v3/templates/${process.env.TX_PAYED_TEMPLATE}`,
    method: 'GET',
    // headers: headers
  }
  const request = {
    url: `/v3/stats`,
    method: 'GET',
    qs: {"start_date": "2022-03-03"}
  }
  
//   const req = require("@sendgrid/client");
//   req.setApiKey(process.env.SENDGRID_API_KEY);
//   req.request(request1)
//     .then(([response, body]) => {
//       console.log(response.statusCode);
//     //   console.log(util.inspect({body: body}, {depth: null}));
//       require("fs").writeFileSync("./lib/email_templates/tx_payed.html", body.versions[0].html_content)
//     })
//     .catch(error => {
//       console.error(util.inspect({error}, {depth: null}));
//     });


// apiInstance.sendTransacEmail(sendSmtpEmail).then(function(data) {
//   console.log('API called successfully. Returned data: ' + data);
// }, function(error) {
//   console.error(error);
// });
// sendAuthCode({emailAddress: "chaliman.co@yahoo.com", firstName: "charles"}, 4586, (err, res) => console.log(util.inspect({err, res}, {depth: null})))