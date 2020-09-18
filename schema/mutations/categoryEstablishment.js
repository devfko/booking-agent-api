const graphql = require('graphql');
const typeDefs = require('../types/typeQueries');
const mongoose = require('mongoose');
const { validatorHash } = require('../../util/bcrypt');

const { ApolloError } = require('apollo-server-express');

const {
    GraphQLString,
    GraphQLNonNull,
    GraphQLID
} = graphql;

const modelCommCategory = mongoose.model('categoryEstablishment');

const addCategoryEstablishment = {
    type: typeDefs.CommercialCategoryType,
    description: 'Creación de Categorias de Establecimientos',
    args: {
        name: { type: GraphQLNonNull(GraphQLString) },
        url: { type: GraphQLNonNull(GraphQLString) },
        token: { type: new GraphQLNonNull(GraphQLString) }
    },
    async resolve(parent, args) {

        const resultToken = await validatorHash(args.token);

        if (!resultToken) {
            throw new ApolloError("Unauthorized", "401");
        }

        let category = new modelCommCategory({
            name: args.name,
            url: args.url
        });

        try {
            return category.save();
        } catch (err) {
            throw new ApolloError("Bad Request", "400");
        }
    }
};

module.exports = { addCategoryEstablishment };