const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const photoSchema = new Schema({
    file_location: {
        type: String,
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Photo', photoSchema);