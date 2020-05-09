const MongoLib = require('../db/db');

class CountryService {
    constructor() {
        this.collection = 'countries';
        this.mongoDB = new MongoLib();
    }

    async getCountries({ name }) {
        const query = name && {
            name: name
        };

        const countries = await this.mongoDB.getAll(this.collection, query);
        return countries || [];
    }
}

module.exports = CountryService;