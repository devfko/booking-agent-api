const mongoose = require('mongoose');
const Schema = mongoose.Schema;

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

module.exports = mongoose.model('City', citySchema);