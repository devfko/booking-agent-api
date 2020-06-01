const mongoose = require('mongoose');
const { config } = require('../config');

/** Conexión a Production */
let Mongo_URI = `mongodb+srv://${config.dbUser}:${config.dbPass}@${config.dbHost}/${config.dbName}?retryWrites=true&w=majority`;

/** Conexión a Development */
if (!config.envApp) {
    Mongo_URI = `mongodb://${config.dbHost}:${config.dbPort}/${config.dbName}`;
}

mongoose.connect(Mongo_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
});
mongoose.connection.on('error', console.error.bind(console, "MongoDB Connection Error : "));

mongoose.connection.once('open', () => {
    console.log('Connection DataBase Successfully!!');
});