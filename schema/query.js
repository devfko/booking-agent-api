const graphql = require('graphql');
const typeDefs = require('./types/typeQueries');
const mongoose = require('mongoose');

const modelCountry = require('../models/country');
const modelDepartment = require('../models/department');
const modelCity = require('../models/city');
const modelSchedule = require('../models/schedule');
const modelCommCategory = require('../models/commercial_category');
const modelCommEstablishment = require('../models/commercial_establishment');
const modelCommSchedule = require('../models/commercial_schedule');
const modelUser = require('../models/user');
const modelCommBooking = require('../models/commercial_booking');

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

const RootQuery = new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
        booking: {
            type: new GraphQLList(typeDefs.CommercialBookingType),
            description: 'Obtenemos todas las reservas de un establecimiento o Usuario especifico por ID',
            args: {
                commercialID: { type: GraphQLID },
                userID: { type: GraphQLID },
            },
            async resolve(parent, args) {

                return await modelCommBooking.aggregate([{
                        $match: {
                            $or: [
                                { "commercialID": new mongoose.Types.ObjectId(args.commercialID) },
                                { "userID": new mongoose.Types.ObjectId(args.userID) }
                            ]
                        }
                    },
                    { $sort: { date: -1, time: 1 } },
                    {
                        $project: {
                            _id: false,
                            id: '$_id',
                            date: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
                            time: { $dateToString: { format: '%H:%M:%S', date: '$time' } },
                            state: '$state',
                            price: '$price',
                            quantity: '$quantity',
                            voucher: '$voucher',
                            user: '$userID',
                            establishment: '$commercialID'
                        }
                    }
                ]);
            }
        },
        commercial_category: {
            type: typeDefs.CommercialCategoryType,
            description: 'Obtenemos la información de una categoria especifica por ID o por name',
            args: {
                id: { type: GraphQLID, description: 'Campo Opcional # 1' },
                name: { type: GraphQLString, description: 'Campo Opcional # 2' }
            },
            async resolve(parent, args) {
                return await modelCommCategory.findOne({ $or: [{ _id: args.id }, { name: args.name }] });
            }
        },
        schedule: {
            type: new GraphQLList(typeDefs.ScheduleType),
            description: 'Obtenemos la información de horario de atención estándar por un ID especifico',
            args: { id: { type: new GraphQLNonNull(GraphQLID) } },
            async resolve(parent, args) {

                return await modelSchedule.aggregate([
                    { $match: { "_id": new mongoose.Types.ObjectId(args.id) } },
                    { $sort: { init_time: 1 } },
                    {
                        $project: {
                            _id: false,
                            id: '$_id',
                            init_time: { $dateToString: { format: '%H:%M:%S', date: '$init_time' } },
                            final_time: { $dateToString: { format: '%H:%M:%S', date: '$final_time' } }
                        }
                    }
                ]);

            }
        },
        schedules: {
            type: new GraphQLList(typeDefs.ScheduleType),
            description: 'Obtenemos todos los horarios de atención parametrizados en la Base',
            async resolve(parent, args) {

                return await modelSchedule.aggregate([{
                        $project: {
                            _id: false,
                            id: '$_id',
                            init_time: { $dateToString: { format: '%H:%M:%S', date: '$init_time' } },
                            final_time: { $dateToString: { format: '%H:%M:%S', date: '$final_time' } }
                        }
                    },
                    { $sort: { init_time: 1 } }
                ]);
            }
        },
        commercial_schedule: {
            type: typeDefs.CommercialScheduleType,
            description: 'Obtenemos los horarios de atención de un establecimiento especifico por ID',
            args: { commercialID: { type: new GraphQLNonNull(GraphQLID) } },
            async resolve(parent, args) {
                return await modelCommSchedule.findOne({ commercialID: args.commercialID });
            }
        },
        commercial_establishment: {
            type: typeDefs.CommercialEstablishmentType,
            description: 'Obtenemos un establecimiento especifico por filtro de ID o name',
            args: {
                id: { type: GraphQLID, description: 'Campo Opcional # 1' },
                name: { type: GraphQLString, description: 'Campo Opcional # 2' }
            },
            async resolve(parent, args) {
                let likeStr = '.*' + args.name + '.*';
                return await modelCommEstablishment.findOne({ $or: [{ _id: args.id }, { name: { $regex: likeStr, $options: "i" } }] });
            }
        },
        commercial_establishments: {
            type: new GraphQLList(typeDefs.CommercialEstablishmentType),
            description: 'Obtenemos los establecimientos comerciales registrados con o sin filtro de estado',
            args: { active: { type: GraphQLBoolean, description: 'Valores de true = Activos / false = Inactivos' } },
            async resolve(parent, args) {
                const { active } = args;
                let query = {
                    active: {
                        $in: active
                    }
                };
                query = (typeof active !== "undefined") ? query : {};
                return await modelCommEstablishment.find(query).sort({ name: 1, active: -1 });
            }
        },
        city: {
            type: typeDefs.CityType,
            description: 'Obtenemos la información de una Ciudad especifica por ID',
            args: { id: { type: new GraphQLNonNull(GraphQLID) } },
            async resolve(parent, args) {
                return await modelCity.findById(args.id);
            }
        },
        cities: {
            type: new GraphQLList(typeDefs.CityType),
            description: 'Obtenemos el listado de las Ciudades parametrizadas en la Base',
            async resolve(parent, args) {
                return await modelCity.find({}).sort({ name: 1 });
            }
        },
        department: {
            type: typeDefs.DepartmentType,
            description: 'Obtenemos la información de un Departamento especifico por ID',
            args: { id: { type: new GraphQLNonNull(GraphQLID) } },
            async resolve(parent, args) {
                return await modelDepartment.findById(args.id);
            }
        },
        departments: {
            type: new GraphQLList(typeDefs.DepartmentType),
            description: 'Obtenemos el listado de Departamentos parametrizados en la Base',
            async resolve(parent, args) {
                return await modelDepartment.find({}).sort({ name: 1 });
            }
        },
        country: {
            type: typeDefs.CountryType,
            description: 'Obtenemos la información de un Pais especifico por ID',
            args: { id: { type: new GraphQLNonNull(GraphQLID) } },
            async resolve(parent, args) {
                return await modelCountry.findById(args.id);
            }
        },
        countries: {
            type: new GraphQLList(typeDefs.CountryType),
            description: 'Obtenemos el listado de Piases parametrizados en la Base',
            async resolve(parent, args) {
                return await modelCountry.find({}).sort({ name: 1 });
            }
        },
        user: {
            type: typeDefs.UserType,
            description: 'Obtenemos la información de un Usuario especifico por ID o EMAIL',
            args: {
                id: { type: GraphQLID, description: 'Campo Opcional # 1' },
                email: { type: GraphQLString, description: 'Campo Opcional # 2' }
            },
            async resolve(parent, args) {
                return await modelUser.findOne({ $or: [{ _id: args.id }, { email: args.email }] });
            }
        }
    }
});

module.exports = RootQuery;