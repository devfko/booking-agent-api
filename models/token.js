const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const tokenSchema = new Schema({
    commercialID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Commercial_Establishment',
        required: true
    },
    token: {
        type: String,
        required: true
    },
    created_at: {
        type: Date,
        default: Date.now,
        expires: 43200
    }
});

module.exports = mongoose.model('Token', tokenSchema);