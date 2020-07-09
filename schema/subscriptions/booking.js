const { pubsub } = require('../helper');
const typeSubs = require('../types/typeSubscriptions');

const { GraphQLID, GraphQLNonNull } = require('graphql');

const newBooking = {
    type: typeSubs.SubscriptionBookingType,
    args: {
        commercialID: { type: GraphQLNonNull(GraphQLID) }
    },
    async resolve(parent, args) {
        if (parent.newBooking.establishment === args.commercialID) {
            return parent.newBooking;
        }
    },
    subscribe: () => pubsub.asyncIterator('BOOKING_ADDED_TOPIC'),
};

module.exports = { newBooking };