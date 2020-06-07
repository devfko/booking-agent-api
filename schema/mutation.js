const graphql = require('graphql');

const { GraphQLObjectType } = graphql;

const { addSchedule } = require('./mutations/schedule');
const { addCountry } = require('./mutations/country');
const { addDepartment } = require('./mutations/department');
const { addCity } = require('./mutations/city');
const { addCommercialCategory } = require('./mutations/commercial_category');
const { addCommercialEstablishment, editCommercialEstablishment } = require('./mutations/commercial_establishment');
const { addCommercialSchedule } = require('./mutations/commercial_schedule');
const { addUser, editUser } = require('./mutations/user');
const { addCommercialBooking } = require('./mutations/commercial_booking');

const Mutation = new GraphQLObjectType({
    name: 'Mutation',
    fields: {
        addSchedule,
        addCountry,
        addDepartment,
        addCity,
        addCommercialCategory,
        addCommercialEstablishment,
        editCommercialEstablishment,
        addCommercialSchedule,
        addUser,
        editUser,
        addCommercialBooking
    }
});

module.exports = Mutation;