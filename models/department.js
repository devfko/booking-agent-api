const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const uniqueValidator = require('mongoose-unique-validator');

const departmentSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    countryID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Country'
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

departmentSchema.plugin(uniqueValidator, {
    code: 409,
    message: 'El Departamento {PATH} ya se encuentra registrado'
});

module.exports = mongoose.model('Department', departmentSchema);