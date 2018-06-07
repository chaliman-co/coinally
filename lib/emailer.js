const
    nodemailer = require('nodemailer'),
    serverConfig = require("./config"),
    { EMAIL_ADDRESS } = serverConfig,
    { EMAIL_PASSWORD } = serverConfig,
    { EMAIL_SERVICE } = serverConfig,
    transporter = nodemailer.createTransport({
        service: EMAIL_SERVICE,
        auth: {
            user: EMAIL_ADDRESS,
            pass: EMAIL_PASSWORD
        }
    });


const sendMail = function(address, payload, cb){
    const mailOptions = {
        from: EMAIL_ADDRESS, 
        to: address, 
        subject: payload.subject,
        html: payload.html
    }
    transporter.sendMail(mailOptions, cb)
    console.log({arguments})
}

module.exports = { sendMail, EMAIL_ADDRESS }
