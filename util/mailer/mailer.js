const { config } = require('../../config');
var sgTransport = require('@sendgrid/mail');

module.exports = {
    sendEmail: async function(req, resp, next) {
        let to = config.destEmail;
        sgTransport.setApiKey(config.sendgridAPI);
        mailConfig = {
            to: to,
            from: 'info@faoba.com',
            subject: config.subjEmail,
            html: config.bodyEmail,
        };
        try {
            await sgTransport.send(mailConfig);
        } catch (err) {
            console.log('Error al enviar email : ' + err);
            next(err);
        }
    }
};