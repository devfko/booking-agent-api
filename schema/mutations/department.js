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

const modelDepartment = mongoose.model('department');

const addDepartment = {
    type: typeDefs.DepartmentType,
    description: 'Creación de Departamentos',
    args: {
        name: { type: GraphQLNonNull(GraphQLString) },
        countryID: {
            type: new GraphQLNonNull(GraphQLID),
            description: 'ID del Pais relacionado'
        },
        token: { type: new GraphQLNonNull(GraphQLString) }
    },
    async resolve(parent, args) {

        const resultToken = await validatorHash(args.token);

        if (!resultToken) {
            throw new ApolloError("Unauthorized", "401");
        }

        let department = new modelDepartment({
            name: args.name,
            countryID: args.countryID
        });

        try {
            return department.save();
        } catch (err) {
            throw new ApolloError("Bad Request", "400");
        }
    }
};

module.exports = { addDepartment };