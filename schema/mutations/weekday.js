const graphql = require('graphql');
const typeDefs = require('../types/typeQueries');
const mongoose = require('mongoose');
const { validatorHash } = require('../../util/bcrypt');

const {
    GraphQLString,
    GraphQLNonNull
} = graphql;

const modelWeekday = mongoose.model('Weekday');

const addWeekday = {
    name: 'Weekday',
    type: typeDefs.WeekdayType,
    description: 'Creación de Dias de la Semana',
    args: {
        name: { type: new GraphQLNonNull(GraphQLString) },
        token: { type: new GraphQLNonNull(GraphQLString) }
    },
    async resolve(parent, args) {

        const resultToken = await validatorHash(args.token);

        if (!resultToken) {
            return {};
        }

        let weekday = new modelWeekday({
            name: args.name
        });

        return weekday.save();
    }
};

module.exports = { addWeekday };