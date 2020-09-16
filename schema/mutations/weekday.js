const graphql = require('graphql');
const typeDefs = require('../types/typeQueries');
const mongoose = require('mongoose');
const { validatorHash } = require('../../util/bcrypt');

const {
    GraphQLString,
    GraphQLNonNull,
    GraphQLFloat
} = graphql;

const modelWeekday = mongoose.model('weekday');

const addWeekday = {
    name: 'Weekday',
    type: typeDefs.WeekdayType,
    description: 'Creación de Dias de la Semana',
    args: {
        name: { type: new GraphQLNonNull(GraphQLString) },
        order: { type: new GraphQLNonNull(GraphQLFloat) },
        token: { type: new GraphQLNonNull(GraphQLString) }
    },
    async resolve(parent, args) {

        const resultToken = await validatorHash(args.token);

        if (!resultToken) {
            return {};
        }

        let weekday = new modelWeekday({
            name: args.name,
            order: args.order
        });

        return weekday.save();
    }
};

module.exports = { addWeekday };