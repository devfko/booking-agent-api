const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const voucherSchema = new Schema({
    type_voucher: {
        type: String,
    },
    seq: {
        type: Number,
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('voucher', voucherSchema);