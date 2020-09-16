const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const uniqueValidator = require('mongoose-unique-validator');

const scheduleSchema = new Schema({
    commercialID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Commercial_Establishment',
        required: true
    },
    scheduleID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Schedules',
        required: true
    },
    weekdayID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Weekday',
        required: true
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

scheduleSchema.plugin(uniqueValidator, {
    code: 409,
    message: 'El Rango Horario {PATH} ya se encuentra registrado'
});

scheduleSchema.index({
    commercialID: 1,
    scheduleID: 1,
    weekdayID: 1
}, { unique: true });

module.exports = mongoose.model('scheduleEstablishment', scheduleSchema);