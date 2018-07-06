// const
//     nodemailer = require('nodemailer'),
//     serverConfig = require('./config'),
//     { EMAIL_ADDRESS } = serverConfig,
//     { EMAIL_PASSWORD } = serverConfig,
//     { EMAIL_SERVICE } = serverConfig,
//     transporter = nodemailer.createTransport({
//         service: EMAIL_SERVICE,
//         auth: {
//             user: EMAIL_ADDRESS,
//             pass: EMAIL_PASSWORD,
//         },
//     });


// const sendMail = function (address, payload, cb) {
//     const mailOptions = {
//         from: EMAIL_ADDRESS,
//         to: address,
//         subject: payload.subject,
//         html: payload.html,
//     };
//     transporter.sendMail(mailOptions, cb);
//     console.log({ arguments });
// };

const sendgrid = require('@sendgrid/mail');

/**
 * Send email
 * @param {Object | Array} to
 * @param {Object} substitutions
 * @param {String} templateId
 * @param {Object} options
 * @param {Function} cb
 */
function sendMail(to, substitutions = {}, templateId, options = {}, cb) {
    substitutions = substitutions || {};
    options = options || {};
    sendgrid.setApiKey(process.env.SENDGRID_API_KEY);
    sendgrid.setSubstitutionWrappers('%', '%');

    const users = Array.isArray(to) ? to : [to];

    const msg = {
        to: users.map((u) => {
            u = {
                name: u.firstName,
                email: u.emailAddress,
            };
            return u;
        }),
        from: {
            email: process.env.FROM_EMAIL,
            name: process.env.FROM_NAME,
        },
        substitutions: {
            ...substitutions,
            name: to.firstName,
        },
        templateId,
        ...options,
    };

    sendgrid.send(msg)
        .then(() => {
            if (cb) {
                cb(null);
            }
        })
        .catch((error) => {
            if (cb) {
                cb(error, null);
            }
        });
}

function sendAuthCode(user, code, cb) {
    sendMail(user, { code }, process.env.LOGIN_TEMPLATE, null, cb);
}

function sendOnUserAction(user, item, cb) {
    const substitutions = {
        user: `${user.firstName} ${user.lastName}`,
        id: user._id,
        item
    };

    const admin = {
        name: 'Admin',
        email: process.env.ADMIN_EMAIL
    };

    sendMail(admin, substitutions, process.env.USER_ACTION_TEMPLATE, null, cb);
}

function sendOnNewAccount(user, cb) {
    sendOnUserAction(user, 'bank account', cb);
}

function sendOnVerificationDetail(user, cb) {
    sendOnUserAction(user, 'verification detail', cb);
}

function sendOnTransaction(user, tx, templateId, cb) {
    const substitutions = {
        transaction: tx._id,
        amount: tx.depositAmount
    };

    const options = {
        cc: {
            name: 'Admin',
            email: process.env.ADMIN_EMAIL
        },
    };

    sendMail(user, substitutions, templateId, options, cb);
}

function sendOnNewTransaction(user, tx, cb) {
    sendOnTransaction(user, tx, process.env.NEW_TX_TEMPLATE, cb);
}

function sendOnFailedTransaction(user, tx, cb) {
    sendOnTransaction(user, tx, process.env.TX_FAILED_TEMPLATE, cb);
}

function sendOnCompleteTransaction(user, tx, cb) {
    sendOnTransaction(user, tx, process.env.TX_COMPLETE_TEMPLATE, cb);
}

function sendOnPayedTransaction(user, tx, cb) {
    sendOnTransaction(user, tx, process.env.TX_PAYED_TEMPLATE, cb);
}

module.exports = {
    sendMail,
    sendAuthCode,
    sendOnNewAccount,
    sendOnVerificationDetail,
    sendOnNewTransaction,
    sendOnFailedTransaction,
    sendOnCompleteTransaction,
    sendOnPayedTransaction
};