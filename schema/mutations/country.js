const graphql = require('graphql');
const typeDefs = require('../types/typeQueries');
const mongoose = require('mongoose');
const { validatorHash } = require('../../util/bcrypt');

const { ApolloError } = require('apollo-server-express');

const {
    GraphQLString,
    GraphQLNonNull
} = graphql;

const modelCountry = mongoose.model('country');

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
            throw new ApolloError("Unauthorized", "401");
        }

        let country = new modelCountry({
            name: args.name
        });

        try {
            return country.save();
        } catch (err) {
            throw new ApolloError("Bad Request", "400");
        }

    }
};

module.exports = { addCountry };