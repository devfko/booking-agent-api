const graphql = require('graphql');
const mongoose = require('mongoose');

const modelWeekday = require('../../models/weekday');
const modelCountry = require('../../models/country');
const modelDepartment = require('../../models/department');
const modelCity = require('../../models/city');
const modelSchedule = require('../../models/schedule');
const modelCommCategory = require('../../models/categoryEstablishment');
const modelCommEstablishment = require('../../models/establishment');
const modelCommSchedule = require('../../models/scheduleEstablishment');
const modelUser = require('../../models/user');
const modelBooking = require('../../models/bookingEstablishment');

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
    name: 'CountryObject',
    description: 'Modelo de Paises',
    fields: () => ({
        id: { type: GraphQLID },
        name: { type: GraphQLString },
        departments: {
            type: new GraphQLList(DepartmentType),
            async resolve(parent, args) {
                return await modelDepartment.find({ countryID: parent.id });
            }
        }
    })
});

const DepartmentType = new GraphQLObjectType({
    name: 'DepartmentObject',
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
        }
    })
});

const CityType = new GraphQLObjectType({
    name: 'CityObject',
    description: 'Modelo de Ciudades',
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

const WeekdayType = new GraphQLObjectType({
    name: 'WeekdayObject',
    description: 'Modelo de dias de la semana',
    fields: () => ({
        id: { type: GraphQLID },
        name: { type: GraphQLString },
        order: { type: GraphQLFloat }
    })
});

const ScheduleType = new GraphQLObjectType({
    name: 'ScheduleObject',
    description: 'Modelo de Horarios de Atención Estandar',
    fields: () => ({
        id: { type: GraphQLID },
        init_time: { type: GraphQLString },
        final_time: { type: GraphQLString }
    })
});

const CommercialCategoryType = new GraphQLObjectType({
    name: 'CategoryObject',
    description: 'Modelo de Categorias de Establecimientos',
    fields: () => ({
        id: { type: GraphQLID },
        name: { type: GraphQLString },
        url: { type: GraphQLString, description: 'Url imagen icono de la categoria' }
    })
});

const CommercialEstablishmentType = new GraphQLObjectType({
    name: 'EstablishmentObject',
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
                            from: "scheduleestablishments",
                            foreignField: "weekdayID",
                            as: "commSchedule"
                        }
                    },
                    { $match: { "commSchedule.commercialID": new mongoose.Types.ObjectId(parent._id) } },
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

const infoScheduleCommType = new GraphQLObjectType({
    name: 'InfoScheduleCommercial',
    description: 'Modelo de Retorno de horarios parametrizados por el establecimiento con el dia de la semana',
    fields: () => ({
        weekday: { type: GraphQLString },
        schedule: { type: GraphQLList(ScheduleType) }
    })
});

const CommercialScheduleType = new GraphQLObjectType({
    name: 'ScheduleEstablishmentObject',
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
                            from: "scheduleestablishments",
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
    name: 'UserObject',
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
    name: 'BookingObject',
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
    name: 'ProductObject',
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
    name: "LoginObject",
    description: "Modelo Login Usuarios",
    fields: () => ({
        establishment: { type: GraphQLString },
        token: { type: GraphQLString }
    })
});

const ImageFile = new GraphQLObjectType({
    name: "LogoObject",
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

const AvailableType = new GraphQLObjectType({
    name: "AvailableObject",
    description: "Modelo Disponibilidad Reservas",
    fields: () => ({
        date: { type: GraphQLString },
        time: { type: GraphQLString },
        capacity: { type: GraphQLFloat },
        total: { type: GraphQLFloat },
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
    CommercialPortfolioType,
    AvailableType
};