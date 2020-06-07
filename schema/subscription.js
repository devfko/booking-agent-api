const graphql = require('graphql');
// const typeDefs = require('./typeDefs');
// const mongoose = require('mongoose');

// const modelCommBooking = require('../models/commercial_booking');
// const { pubsub } = require('./helper');
// const BOOKING_ADDED_TOPIC = 'BOOKING_ADDED_TOPIC';

const {
    GraphQLObjectType
} = graphql;

const { newBooking } = require('./mutations/commercial_booking');

const Subscription = new GraphQLObjectType({
    name: 'Subscription',
    fields: {
        newBooking
    }
});

module.exports = Subscription;