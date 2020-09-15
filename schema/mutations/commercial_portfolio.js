const graphql = require('graphql');
const typeDefs = require('../types/typeQueries');
const mongoose = require('mongoose');

const {
    GraphQLString,
    GraphQLNonNull,
    GraphQLID
} = graphql;

const modelCommPortfolio = mongoose.model('Commercial_portfolio');

const addPortfolio = {
    type: typeDefs.CommercialPortfolioType,
    description: 'Creación de Productos por Establecimientos',
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

        let portfolio = new modelCommPortfolio({
            ...args
        });

        return portfolio.save();
    }
};

module.exports = { addPortfolio };