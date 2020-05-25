const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const commCategorySchema = new Schema({
    name: {
        type: String,
        trim: true,
        required: true,
        unique: true
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Commercial_Category', commCategorySchema);