const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const uniqueValidator = require('mongoose-unique-validator');

const weekdaySchema = new Schema({
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

weekdaySchema.plugin(uniqueValidator, {
    code: 409,
    message: 'El dia se la Semana {PATH} ya se encuentra registrado'
});

module.exports = mongoose.model('Weekday', weekdaySchema);