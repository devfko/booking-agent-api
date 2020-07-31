const jwt = require('jsonwebtoken');
const { config } = require('../../config');

function extractToken(req) {

    let token;

    if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {

        token = req.headers.authorization.split(' ')[1];

        return new Promise((resolve, reject) => {
            jwt.verify(token, config.loginToken, (err, verifiedJwt) => {
                if (err) {
                    console.log(err.message);
                    // return null;
                    resolve([]);
                } else {
                    // return verifiedJwt;
                    resolve([verifiedJwt]);
                }
            });
        });

    } else if (req.query && req.query.token) {
        console.log('incomplete');
        return req.query.token;
    }
    // return {};
}

module.exports = {
    extractToken
};