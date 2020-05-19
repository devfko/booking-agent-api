const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const scheduleSchema = new Schema({
    init_time: {
        type: String,
        default: Date.now,
        required: true
    },
    final_time: {
        type: String,
        default: Date.now,
        required: true
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

scheduleSchema.index({
    init_time: 1,
    final_time: 1
}, { unique: true });

module.exports = mongoose.model('Schedules', scheduleSchema);