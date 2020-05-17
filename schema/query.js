const graphql = require('graphql');
const typeDefs = require('./typeDefs');
const moment = require('moment');

const {
    GraphQLObjectType,
    GraphQLString,
    GraphQLID,
    GraphQLInt,
    GraphQLSchema,
    GraphQLList,
    GraphQLNonNull
} = graphql;

const RootQuery = new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
        schedules: {
            type: typeDefs.ScheduleType,
            async resolve(parent, args) {
                return await typeDefs.modelSchedule.find({});
            }
        },
        city: {
            type: typeDefs.CityType,
            args: { id: { type: GraphQLID } },
            async resolve(parent, args) {
                return await typeDefs.modelCity.findById(args.id);
            }
        },
        cities: {
            type: new GraphQLList(typeDefs.CityType),
            async resolve(parent, args) {
                return await typeDefs.modelCity.find({});
            }
        },
        department: {
            type: typeDefs.DepartmentType,
            args: { id: { type: GraphQLID } },
            async resolve(parent, args) {
                return await typeDefs.modelDepartment.findById(args.id);
            }
        },
        departments: {
            type: new GraphQLList(typeDefs.DepartmentType),
            async resolve(parent, args) {
                return await typeDefs.modelDepartment.find({});
            }
        },
        country: {
            type: typeDefs.CountryType,
            args: { id: { type: GraphQLID } },
            async resolve(parent, args) {
                return await typeDefs.modelCountry.findById(args.id);
            }
        },
        countries: {
            type: new GraphQLList(typeDefs.CountryType),
            async resolve(parent, args) {
                return await typeDefs.modelCountry.find({});
            }
        }
    }
});

module.exports = RootQuery;