const graphql = require('graphql');
const typeDefs = require('./types/typeQueries');

const {
    GraphQLObjectType
} = graphql;

const { newBooking } = require('./subscriptions/booking');

const Subscription = new GraphQLObjectType({
    name: 'Subscription',
    fields: {
        newBooking
    }
});

module.exports = Subscription;