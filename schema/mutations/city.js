const graphql = require('graphql');
const typeDefs = require('../typeDefs');
const mongoose = require('mongoose');

const {
    GraphQLString,
    GraphQLNonNull,
    GraphQLID
} = graphql;

const modelCity = mongoose.model('City');

const addCity = {
    type: typeDefs.CityType,
    description: 'Creación de Ciudades',
    args: {
        name: { type: GraphQLNonNull(GraphQLString) },
        departmentID: {
            type: new GraphQLNonNull(GraphQLID),
            description: 'ID del Departamento relacionado'
        }
    },
    async resolve(parent, args) {
        let city = new modelCity({
            name: args.name,
            departmentID: args.departmentID
        });

        return city.save();
    }
};

module.exports = { addCity };