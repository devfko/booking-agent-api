const graphql = require('graphql');
const typeDefs = require('../types/typeQueries');
const moment = require('moment');
const mongoose = require('mongoose');
const { validatorHash } = require('../../util/bcrypt');

const { ApolloError } = require('apollo-server-express');

const {
    GraphQLString,
    GraphQLNonNull
} = graphql;

const modelSchedule = mongoose.model('schedule');

const addSchedule = {
    name: 'Schedule',
    type: typeDefs.ScheduleType,
    description: 'Creación de Horarios de Atención Estándar',
    args: {
        init_time: { type: new GraphQLNonNull(GraphQLString) },
        final_time: { type: new GraphQLNonNull(GraphQLString) },
        token: { type: new GraphQLNonNull(GraphQLString) }
    },
    async resolve(parent, args) {

        const resultToken = await validatorHash(args.token);

        if (!resultToken) {
            throw new ApolloError("Unauthorized", "401");
        }

        moment.locale('es');
        let t_initial = new Date(moment('1970-01-01 ' + args.init_time, 'YYYY-MM-DD HH:mm:ss'));
        let t_final = new Date(moment('1970-01-01 ' + args.final_time, 'YYYY-MM-DD HH:mm:ss'));

        if (moment(t_initial).isValid() && moment(t_final).isValid()) {
            let schedule = new modelSchedule({
                init_time: new Date(t_initial - t_initial.getTimezoneOffset() * 60000),
                final_time: new Date(t_final - t_final.getTimezoneOffset() * 60000)
            });

            return schedule.save();
        } else {
            throw new ApolloError("Bad Request", "400");
        }
    }
};

module.exports = { addSchedule };