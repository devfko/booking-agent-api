const { config } = require('../../config');
const nodemailer = require('nodemailer');

module.exports = {
    sendEmail: function(req, resp) {
        let to = config.destEmail;
        let smtpTransport = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: config.userEmail,
                pass: config.passEmail
            }
        });

        let mailOptions = {
            from: 'info@faoba.com',
            to: to,
            subject: config.subjEmail,
            html: config.bodyEmail
        };

        smtpTransport.sendMail(mailOptions, function(err, resp) {
            if (err) {
                console.log(err);
            } else {
                resp.redirect('/');
            }
        });
    }
};