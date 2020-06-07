const graphql = require('graphql');
const typeDefs = require('../typeDefs');
const moment = require('moment');
const mongoose = require('mongoose');
const { pubsub } = require('../helper');

const {
    GraphQLString,
    GraphQLNonNull,
    GraphQLID,
    GraphQLBoolean,
    GraphQLInt
} = graphql;

const modelCommBooking = mongoose.model('Commercial_Booking');
const BOOKING_ADDED_TOPIC = 'newBooking';

const newBooking = {
    type: typeDefs.CommercialBookingType,
    // subscribe(parent, args, ctx, info) {
    // async resolve(parent, args) {
    //     // async resolve(parent, args) {
    //     console.log('parent : ' + parent);
    //     console.log('args : ' + args);
    //     pubsub.asyncIterator([BOOKING_ADDED_TOPIC]);
    // }
    subscribe: () => pubsub.asyncIterator([BOOKING_ADDED_TOPIC]),
};

const addCommercialBooking = {
    type: typeDefs.CommercialBookingType,
    description: 'Creación de Reservas de un Usuario con un Establecimiento Comercial',
    args: {
        establishment: {
            type: GraphQLNonNull(GraphQLID),
            description: 'ID del Establecimiento Comercial'
        },
        user: {
            type: GraphQLNonNull(GraphQLID),
            description: 'ID del Usuario'
        },
        date: { type: new GraphQLNonNull(GraphQLString) },
        time: { type: new GraphQLNonNull(GraphQLString) },
    },
    async resolve(parent, args) {
        moment.locale('es');
        let dateTime = new Date(args.date + ' ' + args.time);
        if (moment(dateTime).isValid()) {
            let booking = new modelCommBooking({
                date: new Date(dateTime - dateTime.getTimezoneOffset() * 60000),
                time: new Date(dateTime - dateTime.getTimezoneOffset() * 60000),
                commercialID: args.establishment,
                userID: args.user
            });

            const operation = await booking.save();
            pubsub.publish(BOOKING_ADDED_TOPIC, { newBooking: args });
            return operation;
        } else {
            return modelCommBooking;
        }

    }
};

module.exports = { addCommercialBooking, newBooking };