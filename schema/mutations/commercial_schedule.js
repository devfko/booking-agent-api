const graphql = require('graphql');
const typeDefs = require('../typeDefs');
const mongoose = require('mongoose');

const {
    GraphQLString,
    GraphQLNonNull,
    GraphQLID,
    GraphQLBoolean,
    GraphQLInt
} = graphql;

const modelCommSchedule = mongoose.model('Commercial_Schedule');

const addCommercialSchedule = {
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
        }
    },
    async resolve(parent, args) {
        let schedule = new modelCommSchedule({
            ...args
        });

        return schedule.save();
    }
};

module.exports = { addCommercialSchedule };