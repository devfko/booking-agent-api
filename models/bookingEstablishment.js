const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { generarHash } = require('../util/bcrypt');
const uniqueValidator = require('mongoose-unique-validator');

const bookingSchema = new Schema({
    userID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    commercialID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'establishment',
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

bookingSchema.plugin(uniqueValidator, {
    code: 409,
    message: 'El {PATH} ya se encuentra registrado'
});

bookingSchema.index({
    date: 1,
    time: 1
}, { unique: true });

module.exports = mongoose.model('bookingEstablishment', bookingSchema);