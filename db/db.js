const mongoose = require('mongoose');
const { config } = require('../config');

const MONGO_URI = `mongodb://${config.dbHost}:${config.dbPort}/${config.dbName}`;

mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
});

mongoose.connection.once('open', () => {
    console.log('Connection DataBase Successfully!!');
});