const graphql = require('graphql');
const typeDefs = require('../typeDefs');
const mongoose = require('mongoose');

const {
    GraphQLString,
    GraphQLNonNull
} = graphql;

const modelCountry = mongoose.model('Country');

const addCountry = {
    name: 'Country',
    type: typeDefs.CountryType,
    description: 'Creación de Paises',
    args: { name: { type: new GraphQLNonNull(GraphQLString) } },
    async resolve(parent, args) {
        let country = new modelCountry({
            name: args.name
        });
        return country.save();
    }
};

module.exports = { addCountry };