const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { generarHash } = require('../util/bcrypt');
const uniqueValidator = require('mongoose-unique-validator');

const userSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    lastname: {
        type: String,
        required: true
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
    phone: {
        type: String,
        default: 0
    },
    address: {
        type: String,
        trim: true,
        default: ''
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

userSchema.plugin(uniqueValidator, {
    code: 409,
    message: 'El {PATH} ya se encuentra registrado en otro Usuario'
});

userSchema.pre('save', async function(next) {
    if (this.isModified('password')) {
        this.password = await generarHash(this.password);
    }
    next();
});

userSchema.pre('findOneAndUpdate', async function(next) {
    const password = this.getUpdate().$set.password;
    const docToUpdate = await this.model.findOne(this.getQuery());

    if (password != docToUpdate.password) {
        docToUpdate.password = await generarHash(password);
        // Retornamos el valor encryptado como respuesta
        this.getUpdate().$set.password = docToUpdate.password;
    }
    next();
});

module.exports = mongoose.model('User', userSchema);