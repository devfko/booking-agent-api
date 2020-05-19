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
        commercial_category: {
            type: typeDefs.CommercialCategoryType,
            args: { id: { type: GraphQLID }, name: { type: GraphQLString } },
            async resolve(parent, args) {
                return await typeDefs.modelCommCategory.findOne({ $or: [{ _id: args.id }, { name: args.name }] });
            }
        },
        schedule: {
            type: typeDefs.ScheduleType,
            args: { id: { type: GraphQLID } },
            async resolve(parent, args) {
                return await typeDefs.modelSchedule.findById(args.id);
            }
        },
        schedules: {
            type: new GraphQLList(typeDefs.ScheduleType),
            async resolve(parent, args) {
                return await typeDefs.modelSchedule.find({}).sort({ init_time: 1 });
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
                return await typeDefs.modelCity.find({}).sort({ name: 1 });
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
                return await typeDefs.modelDepartment.find({}).sort({ name: 1 });
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
                return await typeDefs.modelCountry.find({}).sort({ name: 1 });
            }
        }
    }
});

module.exports = RootQuery;