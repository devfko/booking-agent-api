const graphql = require('graphql');
const mongoose = require('mongoose');

const modelWeekday = require('../../models/weekday');
const modelCountry = require('../../models/country');
const modelDepartment = require('../../models/department');
const modelCity = require('../../models/city');
const modelSchedule = require('../../models/schedule');
const modelCommCategory = require('../../models/commercial_category');
const modelCommEstablishment = require('../../models/commercial_establishment');
const modelCommSchedule = require('../../models/commercial_schedule');
const modelUser = require('../../models/user');
const modelBooking = require('../../models/commercial_booking');

const {
    GraphQLObjectType,
    GraphQLString,
    GraphQLID,
    GraphQLInt,
    GraphQLSchema,
    GraphQLList,
    GraphQLNonNull,
    GraphQLBoolean,
    GraphQLFloat
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

const WeekdayType = new GraphQLObjectType({
    name: 'Weekday',
    description: 'Modelo de dias de la semana',
    fields: () => ({
        id: { type: GraphQLID },
        name: { type: GraphQLString }
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
        url: { type: GraphQLString, description: 'Url imagen icono de la categoria' },
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
        rating: { type: GraphQLFloat },
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

const infoScheduleCommType = new GraphQLObjectType({
    name: 'InfoScheduleCommercial',
    description: 'Modelo de Retorno de horarios parametrizados por el establecimiento con el dia de la semana',
    fields: () => ({
        weekday: { type: GraphQLString },
        schedule: { type: GraphQLList(ScheduleType) }
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
            type: GraphQLList(infoScheduleCommType),
            description: 'Objeto del Modelo de Horarios de Atención',
            async resolve(parent, args) {

                return await modelWeekday.aggregate([{
                        $project: {
                            "weekday": "$$ROOT"
                        }
                    },
                    {
                        $lookup: {
                            localField: "weekday._id",
                            from: "commercial_schedules",
                            foreignField: "weekdayID",
                            as: "commSchedule"
                        }
                    },
                    { $match: { "commSchedule.commercialID": new mongoose.Types.ObjectId(parent.commercialID) } },
                    {
                        $unwind: {
                            path: "$commSchedule",
                            preserveNullAndEmptyArrays: true
                        }
                    },
                    {
                        $lookup: {
                            localField: "commSchedule.scheduleID",
                            from: "schedules",
                            foreignField: "_id",
                            as: "schedule"
                        }
                    },
                    {
                        $unwind: {
                            path: "$schedule",
                            preserveNullAndEmptyArrays: true
                        }
                    },
                    {
                        $group: {
                            _id: {
                                name: "$weekday.name",
                            },
                            schedule: { "$push": "$schedule" }
                        }
                    },
                    {
                        $project: {
                            "_id": 0,
                            "weekday": "$_id.name",
                            "schedule": {
                                "$map": {
                                    input: "$schedule",
                                    as: "time",
                                    in: {
                                        $cond: {
                                            if: { $eq: ["$$time.init_time", null] },
                                            then: "$$time",
                                            else: {
                                                "id": "$$time._id",
                                                "init_time": { $dateToString: { format: '%H:%M:%S', date: "$$time.init_time" } },
                                                "final_time": { $dateToString: { format: '%H:%M:%S', date: "$$time.final_time" } }
                                            }
                                        }
                                    }
                                }
                            },
                        }
                    }
                ]);
            }
        }
    })
});

const UserType = new GraphQLObjectType({
    name: 'User',
    description: 'Modelo de Usuarios',
    fields: () => ({
        id: { type: GraphQLID },
        name: { type: GraphQLString },
        lastname: { type: GraphQLString },
        email: { type: GraphQLString },
        password: { type: GraphQLString },
        phone: { type: GraphQLString },
        address: { type: GraphQLString }
    })
});

const CommercialBookingType = new GraphQLObjectType({
    name: 'Commercial_Booking',
    description: 'Modelo de Reservas por Establecimiento',
    fields: () => ({
        id: { type: GraphQLID },
        date: { type: GraphQLString },
        time: { type: GraphQLString },
        state: { type: GraphQLBoolean },
        price: { type: GraphQLFloat },
        quantity: { type: GraphQLInt },
        voucher: { type: GraphQLString },
        establishment: {
            type: CommercialEstablishmentType,
            description: 'Objeto del Modelo del Establecimiento',
            async resolve(parent, args) {
                return await modelCommEstablishment.findOne({
                    $or: [
                        { "commercialID": parent.establishment },
                        { "commercialID": parent.commercialID }
                    ]
                });
            }
        },
        user: {
            type: UserType,
            description: 'Objeto del Modelo de Usuario',
            async resolve(parent, args) {
                return await modelUser.findOne({
                    $or: [
                        { "userID": parent.user },
                        { "userID": parent.userID }
                    ]
                });
            }
        }
    })
});

const CommercialPortfolioType = new GraphQLObjectType({
    name: 'Commercial_Portfolio',
    description: 'Modelo de Portafolio de Productos por Establecimiento',
    fields: () => ({
        id: { type: GraphQLID },
        name: { type: GraphQLString },
        description: { type: GraphQLString },
        price: { type: GraphQLFloat },
        image: { type: GraphQLString },
        establishment: {
            type: CommercialEstablishmentType,
            description: 'Objeto del Modelo de Establecimiento',
            async resolve(parent, args) {
                return await modelCommEstablishment.findOne({ "_id": parent.commercialID });
            }
        }
    })
});

const CommercialLogin = new GraphQLObjectType({
    name: "Login",
    description: "Modelo Login Usuarios",
    fields: () => ({
        establishment: { type: GraphQLString },
        token: { type: GraphQLString }
    })
});

const ImageFile = new GraphQLObjectType({
    name: "Photo",
    description: "Modelo Foto-Logo Establecimientos",
    fields: () => ({
        path: {
            description: 'Where it’s stored in the filesystem.',
            type: GraphQLNonNull(GraphQLString),
        },
        filename: {
            description: 'Filename, including extension.',
            type: GraphQLNonNull(GraphQLString),
        },
        mimetype: {
            description: 'MIME type.',
            type: GraphQLNonNull(GraphQLString),
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
    CommercialScheduleType,
    UserType,
    CommercialBookingType,
    CommercialLogin,
    ImageFile,
    WeekdayType,
    CommercialPortfolioType
};