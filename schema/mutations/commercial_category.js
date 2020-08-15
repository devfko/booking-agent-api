const graphql = require('graphql');
const typeDefs = require('../types/typeQueries');
const mongoose = require('mongoose');
const { validatorHash } = require('../../util/bcrypt');

const {
    GraphQLString,
    GraphQLNonNull,
    GraphQLID
} = graphql;

const modelCommCategory = mongoose.model('Commercial_Category');

const addCommercialCategory = {
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
            return {};
        }

        let category = new modelCommCategory({
            name: args.name,
            url: args.url
        });

        return category.save();
    }
};

module.exports = { addCommercialCategory };