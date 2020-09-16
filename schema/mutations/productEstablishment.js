const graphql = require('graphql');
const typeDefs = require('../types/typeQueries');
const mongoose = require('mongoose');
const { config, cloudinaryConfig } = require('../../config');
const { storeUpload, cloudinaryStoreUpload } = require('../../util/uploads/storeFS');

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
    async resolve(parent, args) {

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

        return product.save();
    }
};

module.exports = { addProductEstablishment };