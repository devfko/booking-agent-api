const graphql = require('graphql');
const typeDefs = require('../types/typeQueries');
const moment = require('moment');
const mongoose = require('mongoose');
const { pubsub } = require('../helper');
const genVoucher = require('../../util/generators/voucher');

const {
    GraphQLString,
    GraphQLNonNull,
    GraphQLID,
    GraphQLBoolean,
    GraphQLInt,
    GraphQLFloat
} = graphql;

const modelCommBooking = mongoose.model('Commercial_Booking');
const BOOKING_ADDED_TOPIC = 'BOOKING_ADDED_TOPIC';

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
        price: { type: new GraphQLNonNull(GraphQLFloat) },
        quantity: { type: new GraphQLNonNull(GraphQLInt) }
    },
    async resolve(parent, args) {
        moment.locale('es');
        let dateTime = new Date(args.date + ' ' + args.time);
        if (moment(dateTime).isValid()) {
            let booking = new modelCommBooking({
                date: new Date(dateTime - dateTime.getTimezoneOffset() * 60000),
                time: new Date(dateTime - dateTime.getTimezoneOffset() * 60000),
                commercialID: args.establishment,
                userID: args.user,
                price: args.price,
                quantity: args.quantity,
                voucher: await genVoucher("shop")
            });

            const operation = await booking.save();
            await pubsub.publish(BOOKING_ADDED_TOPIC, {
                newBooking: {
                    bookingId: operation.id,
                    state: operation.state,
                    ...args
                }
            });
            return operation;
        } else {
            return modelCommBooking;
        }

    }
};

module.exports = { addCommercialBooking };