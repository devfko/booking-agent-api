const mongoose = require('mongoose');
const modelVoucher = require('../../models/voucher');

async function genVoucher(name) {
    let ret = await modelVoucher.findOneAndUpdate({ "type_voucher": name }, { $inc: { seq: 1 } }, { new: true, upsert: true });

    console.log(ret);
    return ret.seq;
}

module.exports = genVoucher;