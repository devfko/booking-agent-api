const {
    UserInputError,
    AuthenticationError,
    ForbiddenError,
    ValidationError
} = require('apollo-server-express');

const graphql = require('graphql');
const typeDefs = require('./types/typeQueries');
const mongoose = require('mongoose');

const validateToken = require('../util/token/tokens');

const modelCommPortfolio = require('../models/commercial_portfolio');
const modelWeekday = require('../models/weekday');
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
    GraphQLScalarType,
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
            async resolve(parent, args, context) {
                try {

                    let verifiedToken = await validateToken.extractToken(context.req);

                    if (verifiedToken[0] !== undefined) {

                        // Se válida que el _id del token corresponda con el filtro ingresado de Establecimiento o del Usuario
                        if (verifiedToken[0]._id != args.commercialID && verifiedToken[0]._id != args.userID) {
                            return modelCommBooking.find({ name: 'token_exit_forced' });
                        }

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
                    } else {
                        console.log('-fucking');
                        console.log(verifiedToken);

                        return modelCommBooking.find({ name: 'token_exit_forced' });
                    }
                } catch (error) {
                    throw new Error({ message: "Error returning results", code: 500 });
                }
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
                let likeStr = '.*' + args.name + '.*';
                try {
                    return await modelCommCategory.findOne({ $or: [{ _id: args.id }, { name: { $regex: likeStr, $options: "i" } }] });
                } catch (error) {
                    throw new Error({ message: "Error returning results", code: 500 });
                }
            }
        },
        commercial_categories: {
            type: new GraphQLList(typeDefs.CommercialCategoryType),
            description: 'Obtenemos la información de las categorias de establecimientos',
            async resolve(parent, args) {
                try {
                    return await modelCommCategory.find({}).sort({ name: 1 });
                } catch (error) {
                    throw new Error({ message: "Error returning results", code: 500 });
                }
            }
        },
        schedule: {
            type: new GraphQLList(typeDefs.ScheduleType),
            description: 'Obtenemos la información de horario de atención estándar por un ID especifico',
            args: { id: { type: new GraphQLNonNull(GraphQLID) } },
            async resolve(parent, args) {
                try {
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
                } catch (error) {
                    throw new Error({ message: "Error returning results", code: 500 });
                }
            }
        },
        schedules: {
            type: new GraphQLList(typeDefs.ScheduleType),
            description: 'Obtenemos todos los horarios de atención parametrizados en la Base',
            async resolve(parent, args) {
                try {
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
                } catch (error) {
                    throw new Error({ message: "Error returning results", code: 500 });
                }
            }
        },
        commercial_schedule: {
            type: typeDefs.CommercialScheduleType,
            description: 'Obtenemos los horarios de atención de un establecimiento especifico por ID',
            args: { commercialID: { type: new GraphQLNonNull(GraphQLID) } },
            async resolve(parent, args) {
                try {
                    return await modelCommSchedule.findOne({ commercialID: args.commercialID });
                } catch (error) {
                    throw new Error({ message: "Error returning results", code: 500 });
                }
            }
        },
        commercial_portfolio: {
            type: new GraphQLList(typeDefs.CommercialPortfolioType),
            description: 'Obtenemos el listado de los productos o servicios del establecimiento',
            args: { commercialID: { type: new GraphQLNonNull(GraphQLID) } },
            async resolve(parent, args) {
                try {
                    return await modelCommPortfolio.find({ commercialID: args.commercialID }).sort({ name: 1 });
                } catch (error) {
                    throw new Error({ message: "Error returning results", code: 500 });
                }
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
                try {
                    return await modelCommEstablishment.findOne({ $or: [{ _id: args.id }, { name: { $regex: likeStr, $options: "i" } }] });
                } catch (error) {
                    throw new Error({ message: "Error returning results", code: 500 });
                }
            }
        },
        commercial_establishments: {
            type: new GraphQLList(typeDefs.CommercialEstablishmentType),
            description: 'Obtenemos los establecimientos comerciales registrados con o sin filtro de estado',
            args: {
                active: { type: GraphQLBoolean, description: 'Valores de true = Activos / false = Inactivos' },
                categoryID: { type: GraphQLID, description: 'Filtro por Categoria de Establecimiento' },
                cityID: { type: GraphQLID, description: 'Filtro por Ciudad' },
            },
            async resolve(parent, args) {
                let query = {};
                let queryTemp = {};
                let arrQuery = [];

                if (typeof args.active !== "undefined") {
                    queryTemp = {
                        active: {
                            $in: args.active
                        }
                    };

                    arrQuery.push(queryTemp);
                }

                if (typeof args.categoryID !== "undefined") {
                    queryTemp = {
                        categoryID: args.categoryID
                    };

                    arrQuery.push(queryTemp);
                }

                if (typeof args.cityID !== "undefined") {
                    queryTemp = {
                        cityID: args.cityID
                    };

                    arrQuery.push(queryTemp);
                }

                if (arrQuery.length > 0) {
                    query = { $and: arrQuery };
                }

                try {
                    return await modelCommEstablishment.find(query).sort({ name: 1, active: -1 });
                } catch (error) {
                    throw new Error({ message: "Error returning results", code: 500 });
                }
            }
        },
        weekdays: {
            type: new GraphQLList(typeDefs.WeekdayType),
            description: 'Obtenemos el listado de los dias de la Semana',
            async resolve(parent, args) {
                try {
                    return await modelWeekday.find({});
                } catch (error) {
                    throw new Error({ message: "Error returning results", code: 500 });
                }
            }
        },
        city: {
            type: typeDefs.CityType,
            description: 'Obtenemos la información de una Ciudad especifica por ID',
            args: { id: { type: new GraphQLNonNull(GraphQLID) } },
            async resolve(parent, args) {
                try {
                    return await modelCity.findById(args.id);
                } catch (err) {
                    throw new Error({ message: "Error returning results", code: 500 });
                }
            }
        },
        cities: {
            type: new GraphQLList(typeDefs.CityType),
            description: 'Obtenemos el listado de las Ciudades parametrizadas en la Base',
            async resolve(parent, args) {
                try {
                    return await modelCity.find({}).sort({ name: 1 });
                } catch (error) {
                    throw new Error({ message: "Error returning results", code: 500 });
                }
            }
        },
        department: {
            type: typeDefs.DepartmentType,
            description: 'Obtenemos la información de un Departamento especifico por ID',
            args: { id: { type: new GraphQLNonNull(GraphQLID) } },
            async resolve(parent, args) {
                try {
                    return await modelDepartment.findById(args.id);
                } catch (error) {
                    throw new Error({ message: "Error returning results", code: 500 });
                }
            }
        },
        departments: {
            type: new GraphQLList(typeDefs.DepartmentType),
            description: 'Obtenemos el listado de Departamentos parametrizados en la Base',
            async resolve(parent, args) {
                try {
                    return await modelDepartment.find({}).sort({ name: 1 });
                } catch (error) {
                    throw new Error({ message: "Error returning results", code: 500 });
                }
            }
        },
        country: {
            type: typeDefs.CountryType,
            description: 'Obtenemos la información de un Pais especifico por ID',
            args: { id: { type: new GraphQLNonNull(GraphQLID) } },
            async resolve(parent, args) {
                try {
                    return await modelCountry.findById(args.id);
                } catch (error) {
                    throw new Error({ message: "Error returning results", code: 500 });
                }
            }
        },
        countries: {
            type: new GraphQLList(typeDefs.CountryType),
            description: 'Obtenemos el listado de Piases parametrizados en la Base',
            async resolve(parent, args) {
                try {
                    return await modelCountry.find({}).sort({ name: 1 });
                } catch (error) {
                    throw new Error({ message: "Error returning results", code: 500 });
                }
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
                try {
                    return await modelUser.findOne({ $or: [{ _id: args.id }, { email: args.email }] });
                } catch (error) {
                    throw new Error({ message: "Error returning results", code: 500 });
                }
            }
        }
    }
});

module.exports = RootQuery;