const bcrypt = require('bcrypt');
const saltRounds = bcrypt.genSaltSync(12);
const { config } = require('../../config');

/* Función para validar token de creación de parámetros */
async function validatorHash(password) {
    return await bcrypt.compareSync(password, config.mToken);
}

/* Función para generación de Hash para nuevos registros */
async function generarHash(password) {
    return await bcrypt.hash(password, saltRounds);
}

module.exports = {
    validatorHash,
    generarHash
};