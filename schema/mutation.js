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
                let t_initial = moment(args.init_time, 'HH:mm:ss').format('HH:mm:ss');
                let t_final = moment(args.final_time, 'HH:mm:ss').format('HH:mm:ss');
                var formats = ["YYYY-MM-DD LT", "YYYY-MM-DD h:mm:ss A", "YYYY-MM-DD HH:mm:ss", "YYYY-MM-DD HH:mm"];
                // new Date("1970-01-01 " + moment(args.final_time).format('YYYY-MM-DD HH:mm:ss'));

                if (moment("1970-01-01 " + t_initial, formats, true).isValid() && moment("1970-01-01 " + t_final, formats, true).isValid()) {
                    let schedule = new typeDefs.modelSchedule({
                        init_time: t_initial,
                        final_time: t_final
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
        }
    }
});

module.exports = Mutation;