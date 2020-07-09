const graphql = require('graphql');
const typeDefs = require('./typeQueries');

const {
    GraphQLObjectType,
    GraphQLString,
    GraphQLID,
    GraphQLInt,
    GraphQLNonNull,
    GraphQLBoolean,
} = graphql;

const modelCommEstablishment = require('../../models/commercial_establishment');
const modelUser = require('../../models/user');

const SubscriptionBookingType = new GraphQLObjectType({
    name: 'Booking',
    description: 'Modelo Subscription de Reservas',
    fields: () => ({
        bookingId: { type: GraphQLID },
        date: { type: GraphQLString },
        time: { type: GraphQLString },
        state: { type: GraphQLBoolean },
        establishment: {
            type: typeDefs.CommercialEstablishmentType,
            description: 'Objeto del Modelo del Establecimiento',
            async resolve(parent, args) {
                return await modelCommEstablishment.findById({
                    "_id": parent.establishment
                });
            }
        },
        user: {
            type: typeDefs.UserType,
            description: 'Objeto del Modelo de Usuario',
            async resolve(parent, args) {
                return await modelUser.findById({
                    "_id": parent.user
                });
            }
        }
    })
});

module.exports = {
    SubscriptionBookingType
};