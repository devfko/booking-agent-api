const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const uniqueValidator = require('mongoose-unique-validator');

const countrySchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

countrySchema.plugin(uniqueValidator, {
    code: 409,
    message: 'El Pais {PATH} ya se encuentra registrado'
});

module.exports = mongoose.model('country', countrySchema);