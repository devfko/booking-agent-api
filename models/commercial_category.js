const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const uniqueValidator = require('mongoose-unique-validator');

const commCategorySchema = new Schema({
    name: {
        type: String,
        trim: true,
        required: true,
        unique: true
    },
    url: {
        type: String,
        trim: true,
        required: true,
        default: ''
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

commCategorySchema.plugin(uniqueValidator, {
    code: 409,
    message: 'La categoria {PATH} ya se encuentra registrada'
});

module.exports = mongoose.model('Commercial_Category', commCategorySchema);