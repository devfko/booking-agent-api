const graphql = require('graphql');
const mongoose = require('mongoose');

const modelCountry = require('../models/country');
const modelDepartment = require('../models/department');
const modelCity = require('../models/city');
const modelSchedule = require('../models/schedule');
const modelCommCategory = require('../models/commercial_category');
const modelCommEstablishment = require('../models/commercial_Establishment');
const modelCommSchedule = require('../models/commercial_schedule');

const {
    GraphQLObjectType,
    GraphQLString,
    GraphQLID,
    GraphQLInt,
    GraphQLSchema,
    GraphQLList,
    GraphQLNonNull,
    GraphQLBoolean
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
                return await modelCity.find({ "departmentID": new mongoose.Types.ObjectId(parent.id) });
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

const CommercialEstablishmentType = new GraphQLObjectType({
    name: 'Commercial_Establishment',
    fields: () => ({
        id: { type: GraphQLID },
        name: { type: GraphQLString },
        email: { type: GraphQLString },
        password: { type: GraphQLString },
        address: { type: GraphQLString },
        description: { type: GraphQLString },
        logo: { type: GraphQLString },
        phone: { type: GraphQLString },
        active: { type: GraphQLBoolean },
        capacity: { type: GraphQLInt },
        city: {
            type: CityType,
            async resolve(parent, args) {
                return await modelCity.findById(parent.cityID);
            }
        },
        category: {
            type: CommercialCategoryType,
            async resolve(parent, args) {
                return await modelCommCategory.findById(parent.categoryID);
            }
        },
        schedules: {
            type: new GraphQLList(ScheduleType),
            async resolve(parent, args) {

                return await modelSchedule.aggregate([{
                        $lookup: {
                            from: "commercial_schedules",
                            localField: "_id",
                            foreignField: "scheduleID",
                            as: "schedules"
                        }
                    },
                    { $match: { "schedules.commercialID": new mongoose.Types.ObjectId(parent._id) } },
                    {
                        $unwind: {
                            path: "$schedules",
                            preserveNullAndEmptyArrays: true
                        }
                    },
                    { $sort: { "init_time": 1 } },
                    {
                        $project: {
                            _id: 0,
                            id: "$_id",
                            init_time: { $dateToString: { format: '%H:%M:%S', date: '$init_time' } },
                            final_time: { $dateToString: { format: '%H:%M:%S', date: '$final_time' } }
                        }
                    }
                ]);

            }
        }
    })
});

const CommercialScheduleType = new GraphQLObjectType({
    name: 'Commercial_Schedule',
    fields: () => ({
        id: { type: GraphQLID },
        establishment: {
            type: CommercialEstablishmentType,
            async resolve(parent, args) {
                return await modelCommEstablishment.findById(parent.commercialID);
            }
        },
        schedules: {
            type: new GraphQLList(ScheduleType),
            async resolve(parent, args) {

                return await modelSchedule.aggregate([{
                        $lookup: {
                            from: "commercial_schedules",
                            localField: "_id",
                            foreignField: "scheduleID",
                            as: "schedules"
                        }
                    },
                    { $match: { "schedules.commercialID": new mongoose.Types.ObjectId(parent.commercialID) } },
                    {
                        $unwind: {
                            path: "$schedules",
                            preserveNullAndEmptyArrays: true
                        }
                    },
                    { $sort: { "init_time": 1 } },
                    {
                        $project: {
                            _id: 0,
                            id: "$_id",
                            init_time: { $dateToString: { format: '%H:%M:%S', date: '$init_time' } },
                            final_time: { $dateToString: { format: '%H:%M:%S', date: '$final_time' } }
                        }
                    }
                ]);
            }
        }
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
    modelCommCategory,
    CommercialEstablishmentType,
    modelCommEstablishment,
    CommercialScheduleType,
    modelCommSchedule
};