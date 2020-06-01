const graphql = require('graphql');
const mongoose = require('mongoose');

const modelCountry = require('../models/country');
const modelDepartment = require('../models/department');
const modelCity = require('../models/city');
const modelSchedule = require('../models/schedule');
const modelCommCategory = require('../models/commercial_category');
// const modelToken = require('../models/token');
const modelCommEstablishment = require('../models/commercial_establishment');
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
    description: 'Modelo de Paises',
    fields: () => ({
        id: { type: GraphQLID },
        name: { type: GraphQLString },
        department: {
            type: new GraphQLList(DepartmentType),
            async resolve(parent, args) {
                return await modelDepartment.find({ countryID: parent.id });
            }
        },
        token: {
            type: GraphQLString,
            description: 'Token de Autorización de Creación de Parámetros'
        }
    })
});

const DepartmentType = new GraphQLObjectType({
    name: 'Department',
    description: 'Modelo de Departamentos',
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
        },
        token: {
            type: GraphQLString,
            description: 'Token de Autorización de Creación de Parámetros'
        }
    })
});

const CityType = new GraphQLObjectType({
    name: 'City',
    description: 'Modelo de Ciudades',
    fields: () => ({
        id: { type: GraphQLID },
        name: { type: GraphQLString },
        department: {
            type: DepartmentType,
            async resolve(parent, args) {
                return await modelDepartment.findById(parent.departmentID);
            }
        },
        token: {
            type: GraphQLString,
            description: 'Token de Autorización de Creación de Parámetros'
        }
    })
});

const ScheduleType = new GraphQLObjectType({
    name: 'Schedule',
    description: 'Modelo de Horarios de Atención Estandar',
    fields: () => ({
        id: { type: GraphQLID },
        init_time: { type: GraphQLString },
        final_time: { type: GraphQLString },
        token: {
            type: GraphQLString,
            description: 'Token de Autorización de Creación de Parámetros'
        }
    })
});

const CommercialCategoryType = new GraphQLObjectType({
    name: 'Commercial_Category',
    description: 'Modelo de Categorias de Establecimientos',
    fields: () => ({
        id: { type: GraphQLID },
        name: { type: GraphQLString },
        token: {
            type: GraphQLString,
            description: 'Token de Autorización de Creación de Parámetros'
        }
    })
});

const CommercialEstablishmentType = new GraphQLObjectType({
    name: 'Commercial_Establishment',
    description: 'Modelo de Establecimientos Comerciales',
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
            description: 'Objeto del Modelo de Ciudades',
            async resolve(parent, args) {
                return await modelCity.findById(parent.cityID);
            }
        },
        category: {
            type: CommercialCategoryType,
            description: 'Objeto del Modelo de Categorias de Establecimientos',
            async resolve(parent, args) {
                return await modelCommCategory.findById(parent.categoryID);
            }
        },
        schedules: {
            type: new GraphQLList(ScheduleType),
            description: 'Objeto del Modelo de Horarios de Atención',
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
    description: 'Modelo de Horarios de Atención por Establecimiento',
    fields: () => ({
        id: { type: GraphQLID },
        establishment: {
            type: CommercialEstablishmentType,
            description: 'Objeto del Modelo del Establecimiento',
            async resolve(parent, args) {
                return await modelCommEstablishment.findById(parent.commercialID);
            }
        },
        schedules: {
            type: new GraphQLList(ScheduleType),
            description: 'Objeto del Modelo de Horarios de Atención',
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
    DepartmentType,
    CityType,
    ScheduleType,
    CommercialCategoryType,
    CommercialEstablishmentType,
    CommercialScheduleType
};