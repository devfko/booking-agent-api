const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { config } = require('../config');
const mailer = require('../util/mailer/mailer');
const bcrypt = require('bcrypt');
const saltRounds = bcrypt.genSaltSync(12);
const crypto = require('crypto');

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

commEstablishmentSchema.pre('save', function(next) {
    if (this.isModified('password')) {
        this.password = bcrypt.hashSync(this.password, saltRounds);
    }
    next();
});

commEstablishmentSchema.post('save', async function(cb) {
    const email_destination = this.email;
    const token = crypto.randomBytes(16).toString('hex');

    config.destEmail = email_destination;
    config.subjEmail = 'New Account Validation';
    config.bodyEmail = 'Hola, verifica tu cuenta dando clic en ' + config.appURL + (config.appPort !== '' ? ':' + config.appPort : '') + '/token/confirmation/' + token;

    // console.log('Sending email....');
    try {
        await mailer.sendEmail();
    } catch (err) {
        cb(err);
    }
    // console.log('. . . .Email Sended');
});

module.exports = mongoose.model('Commercial_Establishment', commEstablishmentSchema);