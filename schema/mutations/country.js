const graphql = require('graphql');
const typeDefs = require('../types/typeQueries');
const mongoose = require('mongoose');
const { validatorHash } = require('../../util/bcrypt');

const {
    GraphQLString,
    GraphQLNonNull
} = graphql;

const modelCountry = mongoose.model('Country');

const addCountry = {
    name: 'Country',
    type: typeDefs.CountryType,
    description: 'Creación de Paises',
    args: {
        name: { type: new GraphQLNonNull(GraphQLString) },
        token: { type: new GraphQLNonNull(GraphQLString) }
    },
    async resolve(parent, args) {
        const resultToken = await validatorHash(args.token);

        if (!resultToken) {
            return {};
        }

        let country = new modelCountry({
            name: args.name
        });
        return country.save();

    }
};

module.exports = { addCountry };