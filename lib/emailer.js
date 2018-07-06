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

module.exports = { sendMail, sendAuthCode };
