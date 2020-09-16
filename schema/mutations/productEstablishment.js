const graphql = require('graphql');
const typeDefs = require('../types/typeQueries');
const mongoose = require('mongoose');

const {
    GraphQLString,
    GraphQLNonNull,
    GraphQLID
} = graphql;

const modelCommPortfolio = mongoose.model('productEstablishment');

const addProductEstablishment = {
    type: typeDefs.CommercialPortfolioType,
    description: 'Creación de Productos del Establecimiento',
    args: {
        name: { type: GraphQLNonNull(GraphQLString) },
        price: { type: GraphQLNonNull(graphql.GraphQLFloat) },
        description: { type: GraphQLString },
        image: { type: GraphQLString },
        commercialID: {
            type: new GraphQLNonNull(GraphQLID),
            description: 'ID del Establecimiento relacionado'
        }
    },
    async resolve(parent, args) {

        let product = new modelCommPortfolio({
            ...args
        });

        return product.save();
    }
};

module.exports = { addProductEstablishment };