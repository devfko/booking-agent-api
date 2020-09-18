const graphql = require('graphql');
const typeDefs = require('../types/typeQueries');
const moment = require('moment');
const mongoose = require('mongoose');
const { pubsub } = require('../helper');

const validateToken = require('../../util/token/tokens');
const genVoucher = require('../../util/generators/voucher');

const { ApolloError } = require('apollo-server-express');

const {
    GraphQLString,
    GraphQLNonNull,
    GraphQLID,
    GraphQLBoolean,
    GraphQLInt,
    GraphQLFloat
} = graphql;

const modelCommBooking = mongoose.model('bookingEstablishment');
const BOOKING_ADDED_TOPIC = 'BOOKING_ADDED_TOPIC';

const addBookingUser = {
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

        try {
            let dateTime = new Date(args.date + " " + args.time);

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
                throw new ApolloError("Bad Request", "400");
            }
        } catch (err) {
            throw new ApolloError("Bad Request", "400");
        }
    }
};

const editBookingUser = {
    type: typeDefs.CommercialBookingType,
    description: 'Modificación de Reservas realizadas',
    args: {
        id: { type: GraphQLNonNull(GraphQLID) },
        commercialID: { type: GraphQLNonNull(GraphQLID) },
        date: { type: GraphQLNonNull(GraphQLString) },
        time: { type: GraphQLNonNull(GraphQLString) },
        price: { type: GraphQLFloat },
        state: { type: GraphQLNonNull(GraphQLBoolean) },
        quantity: { type: GraphQLInt }
    },
    async resolve(parent, args, context) {

        let verifiedToken = await validateToken.extractToken(context.req);

        if (verifiedToken[0] !== undefined) {

            // Se valida que el _id del token corresponda con el id del Establecimiento al cual se encuentra registrada la reserva
            if (verifiedToken[0]._id != args.commercialID) {
                throw new ApolloError("Unauthorized", "401");
            }

            moment.locale('es');
            let dateTime = new Date(args.date + ' ' + args.time);

            if (moment(dateTime).isValid()) {

                args.date = new Date(dateTime - dateTime.getTimezoneOffset() * 60000);
                args.time = new Date(dateTime - dateTime.getTimezoneOffset() * 60000);

                return new Promise((resolve, reject) => {
                    modelCommBooking.findOneAndUpdate({
                        $and: [
                            { "_id": mongoose.Types.ObjectId(args.id) },
                            { "commercialID": mongoose.Types.ObjectId(args.commercialID) }
                        ]
                    }, { "$set": args }, { new: true }).exec((err, resp) => {
                        if (err) reject(err);
                        else resolve(resp);
                    });
                });
            } else {
                throw new ApolloError("Bad Request", "400");
            }
        } else {
            throw new ApolloError("Forbidden", "403");
        }
    }
};

module.exports = {
    addBookingUser,
    editBookingUser
};