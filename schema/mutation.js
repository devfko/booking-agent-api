const graphql = require('graphql');

const { GraphQLObjectType } = graphql;

const { addSchedule } = require('./mutations/schedule');
const { addCountry } = require('./mutations/country');
const { addDepartment } = require('./mutations/department');
const { addCity } = require('./mutations/city');
const { addWeekday } = require('./mutations/weekday');
const { addPortfolio } = require('./mutations/commercial_portfolio');
const { addCommercialCategory } = require('./mutations/commercial_category');
const {
    addCommercialEstablishment,
    editCommercialEstablishment,
    loginCommercialEstablishment,
    singleImageEstablishment,
    multipleImageTesting
} = require('./mutations/commercial_establishment');
const { addCommercialSchedule } = require('./mutations/commercial_schedule');
const { addUser, editUser } = require('./mutations/user');
const { addCommercialBooking, editCommercialBooking } = require('./mutations/commercial_booking');

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
        loginCommercialEstablishment,
        addCommercialSchedule,
        addUser,
        editUser,
        addCommercialBooking,
        editCommercialBooking,
        singleImageEstablishment,
        multipleImageTesting,
        addWeekday,
        addPortfolio
    }
});

module.exports = Mutation;