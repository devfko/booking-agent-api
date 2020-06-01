const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { config } = require('../config');
const mailer = require('../util/mailer/mailer');
const crypto = require('crypto');
const { generarHash } = require('../util/bcrypt');
const uniqueValidator = require('mongoose-unique-validator');

// const modelToken = require('./token');
const modelToken = mongoose.model('Token');

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
        // select: false
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

commEstablishmentSchema.plugin(uniqueValidator, {
    code: 409,
    message: 'El {PATH} ya se encuentra registrado en otro establecimiento'
});

commEstablishmentSchema.pre('save', async function(next) {
    console.log('una avioneta pasó por aqui....');
    if (this.isModified('password')) {
        this.password = await generarHash(this.password);
    }
    next();
});

commEstablishmentSchema.pre('update', async function(next) {
    const password = this.getUpdate().$set.password;
    const docToUpdate = await this.model.findOne(this.getQuery());

    console.log('....tirando papeletas de que color?');
    if (password != docToUpdate.password) {
        docToUpdate.password = await generarHash(password);
        // Retornamos el valor encryptado como respuesta
        this.getUpdate().$set.password = docToUpdate.password;
    }
    // console.log(docToUpdate.password);

    next();
});

commEstablishmentSchema.post('save', async function(cb) {

    if (config.sendgridAPI !== '') {
        const email_destination = this.email;
        const token = new modelToken({ commercialID: this.id, token: crypto.randomBytes(16).toString('hex') });

        await token.save(async function(err) {
            if (err) {
                return console.log(err.message);
            }

            const urlToken = config.appURL + (config.appPort !== '' ? ':' + config.appPort : '') + '/token/confirmation/' + token.token;
            config.destEmail = email_destination;
            config.subjEmail = 'New Account Validation';
            config.bodyEmail = `<p><strong>Hola, por favor verifica tu cuenta dando clic en la imagen para activar tu cuenta</strong></p><br />
        <p><a title='Account Activation' href='${urlToken}' target="_blank" rel="noopener"><img style="display: block; margin-left: auto; margin-right: auto;" src="https://scontent.fclo7-1.fna.fbcdn.net/v/t1.0-9/20245767_1447449845349395_5492820255884438272_n.png?_nc_cat=102&amp;_nc_sid=85a577&amp;_nc_ohc=RefifhzEjNkAX9L3zbI&amp;_nc_ht=scontent.fclo7-1.fna&amp;oh=6586ce5831c24de08606b50957ec732a&amp;oe=5EFA7312" width="200" height="200" /></a></p><br />`;

            try {
                await mailer.sendEmail();
            } catch (errMail) {
                console.log(errMail);
                cb();
            }
        });
    }
});

module.exports = mongoose.model('Commercial_Establishment', commEstablishmentSchema);