const graphql = require('graphql');
const typeDefs = require('../types/typeQueries');
const mongoose = require('mongoose');

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { config } = require('../../config');
const validateToken = require('../../util/token/tokens');

const {
    GraphQLString,
    GraphQLNonNull,
    GraphQLID,
    GraphQLBoolean,
    GraphQLInt,
    GraphQLFloat
} = graphql;

const { GraphQLUpload } = require('graphql-upload');

const modelCommEstablishment = mongoose.model('Commercial_Establishment');

const addCommercialEstablishment = {
    type: typeDefs.CommercialEstablishmentType,
    description: 'Creación de Establecimientos Comerciales',
    args: {
        name: { type: GraphQLNonNull(GraphQLString) },
        email: { type: GraphQLNonNull(GraphQLString) },
        password: { type: GraphQLNonNull(GraphQLString) },
        address: { type: GraphQLNonNull(GraphQLString) },
        description: { type: GraphQLString },
        logo: { type: GraphQLString },
        phone: { type: GraphQLString },
        active: { type: GraphQLBoolean },
        capacity: { type: GraphQLInt },
        rating: { type: GraphQLFloat },
        cityID: {
            type: new GraphQLNonNull(GraphQLID),
            description: 'ID de la Ciudad relacionada'
        },
        categoryID: {
            type: new GraphQLNonNull(GraphQLID),
            description: 'ID de la Categoria del Establecimiento'
        }
    },
    async resolve(parent, args) {

        let establishment = new modelCommEstablishment({
            ...args
        });

        try {
            return establishment.save();
        } catch (err) {
            console.log(err);
        }
    }
};

const editCommercialEstablishment = {
    type: typeDefs.CommercialEstablishmentType,
    description: 'Modificación de Establecimientos Comerciales',
    args: {
        id: { type: GraphQLNonNull(GraphQLID) },
        name: { type: GraphQLNonNull(GraphQLString) },
        email: { type: GraphQLNonNull(GraphQLString) },
        password: { type: GraphQLNonNull(GraphQLString) },
        address: { type: GraphQLNonNull(GraphQLString) },
        description: { type: GraphQLString },
        logo: { type: GraphQLString },
        phone: { type: GraphQLString },
        active: { type: GraphQLBoolean },
        capacity: { type: GraphQLInt },
        rating: { type: GraphQLFloat },
        cityID: {
            type: new GraphQLNonNull(GraphQLID),
            description: 'ID de la Ciudad relacionada'
        },
        categoryID: {
            type: new GraphQLNonNull(GraphQLID),
            description: 'ID de la Categoria del Establecimiento'
        }
    },
    async resolve(parent, args, context) {

        let verifiedToken = await validateToken.extractToken(context.req);

        if (verifiedToken[0] !== undefined) {

            // Se valida que el _id del token corresponda con el id del Establecimiento que se está modificando
            if (verifiedToken[0]._id != args.id) {
                // return modelCommEstablishment.find({ name: 'token_exit_forced' });
                return {};
            }

            return new Promise((resolve, reject) => {
                modelCommEstablishment.findOneAndUpdate({ "_id": mongoose.Types.ObjectId(args.id) }, { "$set": args }, { new: true }).exec((err, resp) => {
                    if (err) reject(err);
                    else resolve(resp);
                });
            });
        } else {
            return {};
            // return modelCommEstablishment.find({ name: 'token_exit_forced' });
        }
    }
};

const loginCommercialEstablishment = {
    type: typeDefs.CommercialLogin,
    description: 'Login Establecimientos Comerciales',
    args: {
        email: { type: new GraphQLNonNull(GraphQLString) },
        password: { type: new GraphQLNonNull(GraphQLString) }
    },
    async resolve(parent, args) {

        let user = await modelCommEstablishment.find({ email: args.email });

        if (user.length) {

            let userFinded = await bcrypt.compareSync(args.password, user[0].password);

            if (userFinded) {
                const token = jwt.sign({ _id: user[0]._id, email: user[0].email }, config.loginToken, { expiresIn: '1d' });

                return { establishment: user[0].name, token };
            }
        }

        return { establishment: 'Usuario y/o Password no válido', token: "" };

    }
};

const singleImageEstablishment = {
    type: typeDefs.ImageFile,
    description: 'Stores a single file.',
    args: {
        file: {
            description: 'File to store.',
            type: GraphQLNonNull(GraphQLUpload),
        },
        commercialID: { type: GraphQLString },
    },
    resolve: async(parent, { file }, { storeUpload }) => storeUpload(file),
    // resolve: async(parent, args, { storeUpload }) => storeUpload(args),
    // async resolve(parent, args, { storeUpload }) {
    //     storeUpload(args);

    //     console.log(file);
    // },
    // async resolve(parent, args, { storeUpload }) {
    //     console.log('args : ', args);

    //     const result = await storeUpload(args.file);

    //     console.log('result : ', result);
    // }
};

module.exports = {
    addCommercialEstablishment,
    editCommercialEstablishment,
    loginCommercialEstablishment,
    singleImageEstablishment
};