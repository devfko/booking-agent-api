const graphql = require('graphql');
const typeDefs = require('../types/typeQueries');
const mongoose = require('mongoose');
const { validatorHash } = require('../../util/bcrypt');

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
        },
        token: { type: new GraphQLNonNull(GraphQLString) }
    },
    async resolve(parent, args) {

        const resultToken = await validatorHash(args.token);

        if (!resultToken) {
            return {};
        }

        let city = new modelCity({
            name: args.name,
            departmentID: args.departmentID
        });

        return city.save();
    }
};

module.exports = { addCity };