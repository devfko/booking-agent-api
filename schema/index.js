const graphql = require('graphql');
const { GraphQLSchema } = graphql;
const { pubsub } = require('./helper');
const BOOKING_ADDED_TOPIC = 'BOOKING_ADDED_TOPIC';

const RootQuery = require('./query');
const Mutation = require('./mutation');
const Subscription = require('./subscription');

module.exports = new GraphQLSchema({
    query: RootQuery,
    mutation: Mutation,
    subscription: Subscription
});