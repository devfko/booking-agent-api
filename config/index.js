require('dotenv').config();

const config = {
    appPort: process.env.APP_PORT,
    dbHost: process.env.DB_HOST,
    dbPort: process.env.DB_PORT,
    dbUser: process.env.DB_USER,
    dbPass: process.env.DB_PASS,
    dbName: process.env.DB_NAME
};

module.exports = { config };