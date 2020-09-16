const graphql = require('graphql');

const { GraphQLObjectType } = graphql;

const { addSchedule } = require('./mutations/schedule');
const { addCountry } = require('./mutations/country');
const { addDepartment } = require('./mutations/department');
const { addCity } = require('./mutations/city');
const { addWeekday } = require('./mutations/weekday');
const { addCategoryEstablishment } = require('./mutations/categoryEstablishment');
const {
    addEstablishment,
    editEstablishment,
    loginEstablishment,
    singleImageEstablishment,
    multipleImageTesting
} = require('./mutations/establishment');
const { addUser, editUser } = require('./mutations/user');
const { addProductEstablishment } = require('./mutations/productEstablishment');
const { addScheduleEstablishment } = require('./mutations/scheduleEstablishment');
const { addBookingUser, editBookingUser } = require('./mutations/bookingEstablishment');

const Mutation = new GraphQLObjectType({
    name: 'Mutation',
    fields: {
        addCountry,
        addDepartment,
        addCity,
        addSchedule,
        addWeekday,
        addCategoryEstablishment,
        addEstablishment,
        editEstablishment,
        loginEstablishment,
        addUser,
        editUser,
        addProductEstablishment,
        addScheduleEstablishment,
        addBookingUser,
        editBookingUser,
        // singleImageEstablishment,
        // multipleImageTesting,
    }
});

module.exports = Mutation;