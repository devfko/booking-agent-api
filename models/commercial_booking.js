const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { generarHash } = require('../util/bcrypt');
const uniqueValidator = require('mongoose-unique-validator');

const commBookingSchema = new Schema({
    userID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    commercialID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Commercial_Establishment',
        required: true
    },
    state: {
        type: Boolean,
        default: 1
    },
    date: {
        type: Date,
        default: Date.now,
        required: true,
    },
    time: {
        type: Date,
        default: Date.now,
        required: true,
    },
    price: {
        type: Number,
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        default: 1
    },
    voucher: {
        type: String,
        required: true
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

commBookingSchema.plugin(uniqueValidator, {
    code: 409,
    message: 'El {PATH} ya se encuentra registrado'
});

commBookingSchema.index({
    date: 1,
    time: 1
}, { unique: true });

module.exports = mongoose.model('Commercial_Booking', commBookingSchema);