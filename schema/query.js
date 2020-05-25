const graphql = require('graphql');
const typeDefs = require('./typeDefs');
const mongoose = require('mongoose');

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
        commercial_category: {
            type: typeDefs.CommercialCategoryType,
            description: 'Obtenemos la información de una categoria especifica por ID o por name',
            args: {
                id: { type: GraphQLID, description: 'Campo Opcional # 1' },
                name: { type: GraphQLString, description: 'Campo Opcional # 2' }
            },
            async resolve(parent, args) {
                return await typeDefs.modelCommCategory.findOne({ $or: [{ _id: args.id }, { name: args.name }] });
            }
        },
        schedule: {
            type: new GraphQLList(typeDefs.ScheduleType),
            description: 'Obtenemos la información de horario de atención estándar por un ID especifico',
            args: { id: { type: new GraphQLNonNull(GraphQLID) } },
            async resolve(parent, args) {

                return await typeDefs.modelSchedule.aggregate([
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

                return await typeDefs.modelSchedule.aggregate([{
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
                return await typeDefs.modelCommSchedule.findOne({ commercialID: args.commercialID });
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
                return await typeDefs.modelCommEstablishment.findOne({ $or: [{ _id: args.id }, { name: { $regex: likeStr, $options: "i" } }] });
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
                return await typeDefs.modelCommEstablishment.find(query).sort({ name: 1, active: -1 });
            }
        },
        city: {
            type: typeDefs.CityType,
            description: 'Obtenemos la información de una Ciudad especifica por ID',
            args: { id: { type: new GraphQLNonNull(GraphQLID) } },
            async resolve(parent, args) {
                return await typeDefs.modelCity.findById(args.id);
            }
        },
        cities: {
            type: new GraphQLList(typeDefs.CityType),
            description: 'Obtenemos el listado de las Ciudades parametrizadas en la Base',
            async resolve(parent, args) {
                return await typeDefs.modelCity.find({}).sort({ name: 1 });
            }
        },
        department: {
            type: typeDefs.DepartmentType,
            description: 'Obtenemos la información de un Departamento especifico por ID',
            args: { id: { type: new GraphQLNonNull(GraphQLID) } },
            async resolve(parent, args) {
                return await typeDefs.modelDepartment.findById(args.id);
            }
        },
        departments: {
            type: new GraphQLList(typeDefs.DepartmentType),
            description: 'Obtenemos el listado de Departamentos parametrizados en la Base',
            async resolve(parent, args) {
                return await typeDefs.modelDepartment.find({}).sort({ name: 1 });
            }
        },
        country: {
            type: typeDefs.CountryType,
            description: 'Obtenemos la información de un Pais especifico por ID',
            args: { id: { type: new GraphQLNonNull(GraphQLID) } },
            async resolve(parent, args) {
                return await typeDefs.modelCountry.findById(args.id);
            }
        },
        countries: {
            type: new GraphQLList(typeDefs.CountryType),
            description: 'Obtenemos el listado de Piases parametrizados en la Base',
            async resolve(parent, args) {
                return await typeDefs.modelCountry.find({}).sort({ name: 1 });
            }
        }
    }
});

module.exports = RootQuery;