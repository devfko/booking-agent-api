const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const uniqueValidator = require('mongoose-unique-validator');

const portfolioSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        default: ''
    },
    price: {
        type: Number,
        required: true
    },
    image: {
        type: String,
        default: ''
    },
    commercialID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Commercial_Establishment',
        required: true
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

portfolioSchema.plugin(uniqueValidator, {
    code: 409,
    message: 'El producto {PATH} ya se encuentra registrado'
});

portfolioSchema.index({
    commercialID: 1,
    name: 1
}, { unique: true });

module.exports = mongoose.model('Commercial_portfolio', portfolioSchema);