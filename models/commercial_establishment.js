const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const commEstablishmentSchema = new Schema({
    name: {
        type: String,
        trim: true,
        required: true,
        unique: true
    },
    email: {
        type: String,
        trim: true,
        required: true,
        unique: true,
        match: [/\S+@\S+\.\S+/, 'Por favor, digite un email válido']
    },
    password: {
        type: String,
        trim: true,
        required: true,
        select: false
    },
    address: {
        type: String,
        trim: true,
        default: ''
    },
    description: {
        type: String,
        trim: true,
        default: ''
    },
    logo: {
        type: String,
        trim: true,
        default: ''
    },
    phone: {
        type: String,
        trim: true,
        default: ''
    },
    active: {
        type: Boolean,
        default: 0
    },
    capacity: {
        type: Number,
        required: true,
        default: 4
    },
    cityID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'City',
        required: true
    },
    categoryID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Commercial_Category',
        required: true
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Commercial_Establishment', commEstablishmentSchema);