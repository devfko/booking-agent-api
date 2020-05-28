require('dotenv').config();

const config = {
    appPort: process.env.URL_PORT,
    appURL: process.env.URL_DOMAIN,
    dbHost: process.env.DB_HOST,
    dbPort: process.env.DB_PORT,
    dbUser: process.env.DB_USER,
    dbPass: process.env.DB_PASS,
    dbName: process.env.DB_NAME,
    userEmail: process.env.USER_EMAIL,
    passEmail: process.env.PASS_EMAIL,
    destEmail: process.env.DEST_EMAIL,
    bodyEmail: process.env.BODY_EMAIL,
    subjEmail: process.env.SUBJ_EMAIL
};

module.exports = { config };