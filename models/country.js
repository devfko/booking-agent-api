const joi = require('@hapi/joi');

const countryNameSchema = joi.string().max(80);

const CountrySchema = {
    name: countryNameSchema.required()
};

module.exports = { CountrySchema };