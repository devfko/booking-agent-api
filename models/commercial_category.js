const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const commCategorySchema = new Schema({
    name: {
        type: String,
        require: true,
        unique: true
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Commercial_Categories', commCategorySchema);