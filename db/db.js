const { MongoClient, ObjectId } = require('mongodb');
const { config } = require('../config');

// const MONGO_URI = `mongodb+srv://${config.dbUser}:${config.dbPass}@${config.dbHost}/${config.dbName}?retryWrites=true&w=majority`;
const MONGO_URI = `mongodb://${config.dbHost}:${config.dbPort}/${config.dbName}`;

console.log('HOST : ' + config.dbHost + ' PORT: ' + config.dbPort + ' DBNAME: ' + config.dbName);

class MongoLib {
    constructor() {
        this.client = new MongoClient(MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        this.dbName = config.dbName;
    }

    connect() {
        if (!MongoLib.connection) {
            MongoLib.connection = new Promise((resolve, reject) => {
                this.client.connect(err => {
                    if (err) {
                        reject(err);
                    }

                    console.log('Connected Successfully to Mongo');
                    resolve(this.client.db(this.dbName));
                });
            });
        }

        return MongoLib.connection;
    }

    getAll(collection, query) {
        return this.connect()
            .then(db => {
                return db.collection(collection).find(query).toArray();
            });
    }

    get(collection, id) {
        return this.connect()
            .then(db => {
                return db.collection(collection).findOne({
                    _id: ObjectId(id.dataId)
                });
            });
    }

    create(collection, data) {
        return this.connect()
            .then(db => {
                return db.collection(collection).insertOne(data);
            })
            .then(result => result.insertedId);
    }

    update(collection, id, data) {
        return this.connect()
            .then(db => {
                return db.collection(collection).updateOne({
                    _id: ObjectId(id)
                }, { $set: data }, { upsert: true });
            })
            .then(result => result.upsertedId || id);
    }

    delete(collection, id) {
        return this.connect()
            .then(db => {
                return db.collection(collection).deleteOne({
                    _id: ObjectId(id)
                });
            })
            .then(result => id);
    }
}

module.exports = MongoLib;