const express = require('express');

const { CountrySchema } = require('../models/country');

const CountryService = require('../services/country');

function countryApi(app) {
    const router = express.Router();
    app.use('/api/countries', router);

    const countriesServices = new CountryService();

    router.get('/', async function(req, resp, next) {
        const { name } = req.query;

        try {
            const countries = await countriesServices.getCountries({ name });
            resp.status(200).json({
                data: countries,
                message: 'countries listed'
            });

        } catch (err) {
            next(err);
        }
    });
}

module.exports = countryApi;