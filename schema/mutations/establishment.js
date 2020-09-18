const graphql = require('graphql');
const typeDefs = require('../types/typeQueries');
const mongoose = require('mongoose');

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { config, cloudinaryConfig } = require('../../config');
const validateToken = require('../../util/token/tokens');
const { storeUpload, cloudinaryStoreUpload } = require('../../util/uploads/storeFS');

const { ApolloError } = require('apollo-server-express');

const {
    GraphQLString,
    GraphQLNonNull,
    GraphQLID,
    GraphQLBoolean,
    GraphQLInt,
    GraphQLFloat,
    GraphQLList
} = graphql;

const { GraphQLUpload } = require('graphql-upload');
const { ImageFile } = require('../types/typeQueries');

const modelCommEstablishment = mongoose.model('establishment');

const addEstablishment = {
    type: typeDefs.CommercialEstablishmentType,
    description: 'Creación de Establecimientos Comerciales',
    args: {
        name: { type: GraphQLNonNull(GraphQLString) },
        email: { type: GraphQLNonNull(GraphQLString) },
        password: { type: GraphQLNonNull(GraphQLString) },
        address: { type: GraphQLNonNull(GraphQLString) },
        description: { type: GraphQLString },
        logo: { description: 'File to store.', type: GraphQLUpload },
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

        // Se almacena la imagen antes de editar la información, para así obtener el urlPath
        if (args.logo) {
            const result = await cloudinaryStoreUpload(args.logo, cloudinaryConfig.folderLogos);
            if (result.path != "") {
                args.logo = result.path;
            }
        }

        let establishment = new modelCommEstablishment({
            ...args
        });

        try {
            return establishment.save();
        } catch (err) {
            throw new ApolloError("Bad Request", "400");
        }
    }
};

const editEstablishment = {
    type: typeDefs.CommercialEstablishmentType,
    description: 'Modificación del Establecimiento Comercial',
    args: {
        id: { type: GraphQLNonNull(GraphQLID) },
        name: { type: GraphQLNonNull(GraphQLString) },
        email: { type: GraphQLNonNull(GraphQLString) },
        password: { type: GraphQLNonNull(GraphQLString) },
        address: { type: GraphQLNonNull(GraphQLString) },
        description: { type: GraphQLString },
        logo: { description: 'File to store.', type: GraphQLUpload },
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
                throw new ApolloError("Unauthorized", "401");
            }

            // Se almacena la imagen antes de editar la información, para así obtener el urlPath
            if (args.logo) {
                const result = await cloudinaryStoreUpload(args.logo, cloudinaryConfig.folderLogos);
                if (result.path != "") {
                    args.logo = result.path;
                }
            }

            return new Promise((resolve, reject) => {
                modelCommEstablishment.findOneAndUpdate({ "_id": mongoose.Types.ObjectId(args.id) }, { "$set": args }, { new: true }).exec((err, resp) => {
                    if (err) reject(new ApolloError("Bad Request", "400"));
                    else resolve(resp);
                });
            });
        } else {
            throw new ApolloError("Unauthorized", "401");
        }
    }
};

const loginEstablishment = {
    type: typeDefs.CommercialLogin,
    description: 'Login del Establecimiento Comercial',
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

        throw new ApolloError("Forbidden", "403");

    }
};

const logoEstablishment = {
    // type: typeDefs.ImageFile,
    type: typeDefs.CommercialEstablishmentType,
    description: 'Update Image for Commercial Establishment.',
    args: {
        file: {
            description: 'File to store.',
            type: GraphQLNonNull(GraphQLUpload),
        },
        commercialID: { type: GraphQLID },
    },
    async resolve(parent, args) {

        const result = await cloudinaryStoreUpload(args.file, cloudinaryConfig.folderLogos);
        // console.log('path : ', result.path);

        return new Promise((resolve, reject) => {
            modelCommEstablishment.findOneAndUpdate({ "_id": mongoose.Types.ObjectId(args.commercialID) }, { "$set": { "logo": result.path } }, { new: true }).exec((err, resp) => {
                if (err) reject(new ApolloError("Bad Request", "400"));
                else {
                    console.log(resp);
                    resolve(resp);
                }
            });
        });
    }
};

// const multipleImageTesting = {
//     // type: typeDefs.CommercialEstablishmentType,
//     type: GraphQLNonNull(GraphQLList(GraphQLNonNull(typeDefs.ImageFile))),
//     description: 'Stores a single file.',
//     args: {
//         files: {
//             description: 'File to store.',
//             type: GraphQLNonNull(GraphQLList(GraphQLNonNull(GraphQLUpload))),
//         },
//         commercialID: { type: GraphQLID },
//     },
//     async resolve(parent, args) {

//         const results = await Promise.allSettled(args.files.map(storeUpload));
//         return results.reduce((storedFiles, { value, reason }) => {
//             if (value) storedFiles.push(value);
//             // Realistically you would do more than just log an error.
//             else console.error(`Failed to store upload: ${reason}`);
//             return storedFiles;
//         }, []);
//     }
// };

module.exports = {
    addEstablishment,
    editEstablishment,
    loginEstablishment,
    logoEstablishment,
    // multipleImageTesting
};