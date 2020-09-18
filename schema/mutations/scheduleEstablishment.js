const graphql = require('graphql');
const typeDefs = require('../types/typeQueries');
const mongoose = require('mongoose');
const validateToken = require('../../util/token/tokens');

const {
    GraphQLString,
    GraphQLNonNull,
    GraphQLID,
    GraphQLBoolean,
    GraphQLInt
} = graphql;

const modelCommSchedule = mongoose.model('scheduleEstablishment');

const addScheduleEstablishment = {
    type: typeDefs.CommercialScheduleType,
    description: 'Creación de Horarios de Atención de un Establecimiento Comercial',
    args: {
        commercialID: {
            type: GraphQLNonNull(GraphQLID),
            description: 'ID del Establecimiento Comercial'
        },
        scheduleID: {
            type: GraphQLNonNull(GraphQLID),
            description: 'ID del Horario de Atención'
        },
        weekdayID: {
            type: GraphQLNonNull(GraphQLID),
            description: 'ID del Día de la Semana'
        }
    },
    async resolve(parent, args, context) {
        let verifiedToken = await validateToken.extractToken(context.req);

        if (verifiedToken[0] !== undefined) {

            // Se valida que el _id del token corresponda con el id del Establecimiento
            if (verifiedToken[0]._id != args.commercialID) {
                throw new ApolloError("Unauthorized", "401");
            }

            let schedule = new modelCommSchedule({
                ...args
            });

            try {
                return schedule.save();
            } catch (err) {
                throw new ApolloError("Bad Request", "400");
            }
        } else {
            throw new ApolloError("Unauthorized", "401");
        }
    }
};

module.exports = { addScheduleEstablishment };