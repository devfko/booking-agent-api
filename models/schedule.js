const mongoose = require('mongoose');
const graphQLDate = require('graphql-date');
const Schema = mongoose.Schema;

const scheduleSchema = new Schema({
    init_time: {
        type: Date,
        default: Date.now,
        unique: true,
        required: true
    },
    final_time: {
        type: Date,
        default: Date.now,
        unique: true,
        required: true
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Schedule', scheduleSchema);