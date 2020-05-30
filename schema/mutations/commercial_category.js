const graphql = require('graphql');
const typeDefs = require('../typeDefs');
const mongoose = require('mongoose');

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
        name: { type: GraphQLNonNull(GraphQLString) }
    },
    async resolve(parent, args) {
        let category = new modelCommCategory({
            name: args.name
        });

        return category.save();
    }
};

module.exports = { addCommercialCategory };