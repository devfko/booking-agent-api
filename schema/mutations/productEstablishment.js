const graphql = require('graphql');
const typeDefs = require('../types/typeQueries');
const mongoose = require('mongoose');
const { config, cloudinaryConfig } = require('../../config');
const validateToken = require('../../util/token/tokens');
const { storeUpload, cloudinaryStoreUpload } = require('../../util/uploads/storeFS');
const { ApolloError } = require('apollo-server-express');

const {
    GraphQLString,
    GraphQLNonNull,
    GraphQLID
} = graphql;
const { GraphQLUpload } = require('graphql-upload');

const modelCommPortfolio = mongoose.model('productEstablishment');

const addProductEstablishment = {
    type: typeDefs.CommercialPortfolioType,
    description: 'Creación de Productos del Establecimiento',
    args: {
        name: { type: GraphQLNonNull(GraphQLString) },
        price: { type: GraphQLNonNull(graphql.GraphQLFloat) },
        description: { type: GraphQLString },
        image: { description: 'File to store.', type: GraphQLUpload },
        commercialID: {
            type: new GraphQLNonNull(GraphQLID),
            description: 'ID del Establecimiento relacionado'
        }
    },
    async resolve(parent, args, context) {

        let verifiedToken = await validateToken.extractToken(context.req);

        if (verifiedToken[0] !== undefined) {

            // Se valida que el _id del token corresponda con el id del Establecimiento
            if (verifiedToken[0]._id != args.commercialID) {
                throw new ApolloError("Unauthorized", "401");
            }
            // Se almacena la imagen antes de editar la información, para así obtener el urlPath
            if (args.image) {
                const result = await cloudinaryStoreUpload(args.image, cloudinaryConfig.folderImages);
                if (result.path != "") {
                    args.image = result.path;
                }
            }

            let product = new modelCommPortfolio({
                ...args
            });

            try {
                return product.save();
            } catch (err) {
                throw new ApolloError("Bad Request", "400");
            }
        } else {
            throw new ApolloError("Unauthorized", "401");
        }
    }
};

const editProductEstablishment = {
    type: typeDefs.CommercialPortfolioType,
    description: 'Creación de Productos del Establecimiento',
    args: {
        id: { type: GraphQLNonNull(GraphQLID) },
        name: { type: GraphQLNonNull(GraphQLString) },
        price: { type: GraphQLNonNull(graphql.GraphQLFloat) },
        description: { type: GraphQLString },
        image: { description: 'File to store.', type: GraphQLUpload },
        commercialID: {
            type: new GraphQLNonNull(GraphQLID),
            description: 'ID del Establecimiento relacionado'
        }
    },
    async resolve(parent, args, context) {

        let verifiedToken = await validateToken.extractToken(context.req);

        if (verifiedToken[0] !== undefined) {

            // Se valida que el _id del token corresponda con el id del Establecimiento
            if (verifiedToken[0]._id != args.commercialID) {
                throw new ApolloError("Unauthorized", "401");
            }
            // Se almacena la imagen antes de editar la información, para así obtener el urlPath
            if (args.image) {
                const result = await cloudinaryStoreUpload(args.image, cloudinaryConfig.folderImages);
                if (result.path != "") {
                    args.image = result.path;
                }
            }

            let product = new modelCommPortfolio({
                ...args
            });

            return new Promise((resolve, reject) => {
                modelCommPortfolio.findOneAndUpdate({ "_id": mongoose.Types.ObjectId(args.id) }, { "$set": args }, { new: true }).exec((err, resp) => {
                    if (err) reject(new ApolloError("Bad Request", "400"));
                    else resolve(resp);
                });
            });
        } else {
            throw new ApolloError("Unauthorized", "401");
        }
    }
};

module.exports = {
    addProductEstablishment,
    editProductEstablishment
};