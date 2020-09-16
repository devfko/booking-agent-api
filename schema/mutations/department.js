const graphql = require('graphql');
const typeDefs = require('../types/typeQueries');
const mongoose = require('mongoose');
const { validatorHash } = require('../../util/bcrypt');

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
            return {};
        }

        let department = new modelDepartment({
            name: args.name,
            countryID: args.countryID
        });
        return department.save();
    }
};

module.exports = { addDepartment };