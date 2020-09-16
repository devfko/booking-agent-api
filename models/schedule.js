const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const uniqueValidator = require('mongoose-unique-validator');

const scheduleSchema = new Schema({
    init_time: {
        type: Date,
        default: Date.now,
        required: true
    },
    final_time: {
        type: Date,
        default: Date.now,
        required: true
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

scheduleSchema.plugin(uniqueValidator, {
    code: 409,
    message: 'La Franja Horario {PATH} ya se encuentra registrada'
});

scheduleSchema.index({
    init_time: 1,
    final_time: 1
}, { unique: true });

module.exports = mongoose.model('schedule', scheduleSchema);