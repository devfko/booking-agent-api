const graphql = require('graphql');
const { ObjectId } = require('mongodb');
const {
    GraphQLDate,
    GraphQLTime,
    GraphQLDateTime
} = require('graphql-iso-date');

const modelCountry = require('../models/country');
const modelDepartment = require('../models/department');
const modelCity = require('../models/city');
const modelSchedule = require('../models/schedule');
const modelCommCategory = require('../models/commercial_category');

const {
    GraphQLObjectType,
    GraphQLString,
    GraphQLID,
    GraphQLInt,
    GraphQLSchema,
    GraphQLList,
    GraphQLNonNull
} = graphql;

const CountryType = new GraphQLObjectType({
    name: 'Country',
    fields: () => ({
        id: { type: GraphQLID },
        name: { type: GraphQLString },
        department: {
            type: new GraphQLList(DepartmentType),
            async resolve(parent, args) {
                return await modelDepartment.find({ countryID: parent.id });
            }
        }
    })
});

const DepartmentType = new GraphQLObjectType({
    name: 'Department',
    fields: () => ({
        id: { type: GraphQLID },
        name: { type: GraphQLString },
        country: {
            type: CountryType,
            async resolve(parent, args) {
                return await modelCountry.findById(parent.countryID);
            }
        },
        city: {
            type: new GraphQLList(CityType),
            async resolve(parent, args) {
                return await modelCity.find({ "departmentID": ObjectId(parent.id) });
            }
        }
    })
});

const CityType = new GraphQLObjectType({
    name: 'City',
    fields: () => ({
        id: { type: GraphQLID },
        name: { type: GraphQLString },
        department: {
            type: DepartmentType,
            async resolve(parent, args) {
                return await modelDepartment.findById(parent.departmentID);
            }
        }
    })
});

const ScheduleType = new GraphQLObjectType({
    name: 'Schedule',
    fields: () => ({
        id: { type: GraphQLID },
        init_time: { type: GraphQLString },
        final_time: { type: GraphQLString }
    })
});

const CommercialCategoryType = new GraphQLObjectType({
    name: 'Commercial_Category',
    fields: () => ({
        id: { type: GraphQLID },
        name: { type: GraphQLString }
    })
});

module.exports = {
    CountryType,
    modelCountry,
    DepartmentType,
    modelDepartment,
    CityType,
    modelCity,
    ScheduleType,
    modelSchedule,
    CommercialCategoryType,
    modelCommCategory
};