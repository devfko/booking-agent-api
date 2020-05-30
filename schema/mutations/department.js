const graphql = require('graphql');
const typeDefs = require('../typeDefs');
const mongoose = require('mongoose');

const {
    GraphQLString,
    GraphQLNonNull,
    GraphQLID
} = graphql;

const modelDepartment = mongoose.model('Department');

const addDepartment = {
    type: typeDefs.DepartmentType,
    description: 'Creación de Departamentos',
    args: {
        name: { type: GraphQLNonNull(GraphQLString) },
        countryID: {
            type: new GraphQLNonNull(GraphQLID),
            description: 'ID del Pais relacionado'
        }
    },
    async resolve(parent, args) {
        let department = new modelDepartment({
            name: args.name,
            countryID: args.countryID
        });
        return department.save();
    }
};

module.exports = { addDepartment };