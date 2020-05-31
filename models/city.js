const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const uniqueValidator = require('mongoose-unique-validator');

const citySchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    departmentID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department',
        required: true
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

citySchema.plugin(uniqueValidator, {
    code: 409,
    message: 'La ciudad {PATH} ya se encuentra registrada'
});

module.exports = mongoose.model('City', citySchema);