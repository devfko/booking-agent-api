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
    GraphQLNonNull,
    GraphQLBoolean
} = graphql;

const Mutation = new GraphQLObjectType({
    name: 'Mutation',
    fields: {
        addSchedule: {
            type: typeDefs.ScheduleType,
            args: {
                init_time: { type: new GraphQLNonNull(GraphQLString) },
                final_time: { type: new GraphQLNonNull(GraphQLString) },
            },
            async resolve(parent, args) {
                moment.locale('es');
                let t_initial = new Date(moment('1970-01-01 ' + args.init_time, 'YYYY-MM-DD HH:mm:ss'));
                let t_final = new Date(moment('1970-01-01 ' + args.final_time, 'YYYY-MM-DD HH:mm:ss'));

                if (moment(t_initial).isValid() && moment(t_final).isValid()) {
                    let schedule = new typeDefs.modelSchedule({
                        init_time: new Date(t_initial - t_initial.getTimezoneOffset() * 60000),
                        final_time: new Date(t_final - t_final.getTimezoneOffset() * 60000)
                    });

                    return schedule.save();
                } else {
                    return typeDefs.modelSchedule;
                }
            }
        },
        addCountry: {
            type: typeDefs.CountryType,
            args: {
                name: { type: new GraphQLNonNull(GraphQLString) }
            },
            async resolve(parent, args) {
                let country = new typeDefs.modelCountry({
                    name: args.name
                });
                return country.save();
            }
        },
        addDepartment: {
            type: typeDefs.DepartmentType,
            args: {
                name: { type: GraphQLNonNull(GraphQLString) },
                countryID: { type: new GraphQLNonNull(GraphQLID) }
            },
            async resolve(parent, args) {
                let department = new typeDefs.modelDepartment({
                    name: args.name,
                    countryID: args.countryID
                });
                return department.save();
            }
        },
        addCity: {
            type: typeDefs.CityType,
            args: {
                name: { type: GraphQLNonNull(GraphQLString) },
                departmentID: { type: new GraphQLNonNull(GraphQLID) }
            },
            async resolve(parent, args) {
                let city = new typeDefs.modelCity({
                    name: args.name,
                    departmentID: args.departmentID
                });

                return city.save();
            }
        },
        addCommercialCategory: {
            type: typeDefs.CommercialCategoryType,
            args: {
                name: { type: GraphQLNonNull(GraphQLString) }
            },
            async resolve(parent, args) {
                let category = new typeDefs.modelCommCategory({
                    name: args.name
                });

                return category.save();
            }
        },
        addCommercialEstablishment: {
            type: typeDefs.CommercialEstablishmentType,
            args: {
                name: { type: GraphQLNonNull(GraphQLString) },
                email: { type: GraphQLNonNull(GraphQLString) },
                password: { type: GraphQLNonNull(GraphQLString) },
                address: { type: GraphQLString },
                description: { type: GraphQLString },
                logo: { type: GraphQLString },
                phone: { type: GraphQLString },
                active: { type: GraphQLBoolean },
                capacity: { type: GraphQLInt },
                cityID: { type: new GraphQLNonNull(GraphQLID) },
                categoryID: { type: new GraphQLNonNull(GraphQLID) }
            },
            async resolve(parent, args) {

                let establishment = new typeDefs.modelCommEstablishment({
                    ...args
                });

                try {
                    return establishment.save();
                } catch (err) {
                    console.log(err);
                }
            }
        },
        addCommercialSchedule: {
            type: typeDefs.CommercialScheduleType,
            args: {
                commercialID: { type: GraphQLNonNull(GraphQLID) },
                scheduleID: { type: GraphQLNonNull(GraphQLID) }
            },
            async resolve(parent, args) {
                let schedule = new typeDefs.modelCommSchedule({
                    ...args
                });

                return schedule.save();
            }
        }
    }
});

module.exports = Mutation;