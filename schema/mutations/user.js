const graphql = require('graphql');
const typeDefs = require('../types/typeQueries');
const mongoose = require('mongoose');

const { ApolloError } = require('apollo-server-express');

const {
    GraphQLString,
    GraphQLNonNull,
    GraphQLID
} = graphql;

const modelUser = mongoose.model('user');

const addUser = {
    type: typeDefs.UserType,
    description: 'Creación de Usuarios',
    args: {
        name: { type: new GraphQLNonNull(GraphQLString) },
        lastname: { type: new GraphQLNonNull(GraphQLString) },
        email: { type: new GraphQLNonNull(GraphQLString) },
        password: { type: new GraphQLNonNull(GraphQLString) },
        phone: { type: GraphQLString },
        address: { type: GraphQLString }
    },
    async resolve(parent, args) {

        let newUser = new modelUser({
            ...args
        });

        try {
            return newUser.save();
        } catch (err) {
            throw new ApolloError("Bad Request", "400");
        }

    }
};

const editUser = {
    type: typeDefs.UserType,
    description: 'Modificación de Usuarios',
    args: {
        id: { type: GraphQLNonNull(GraphQLID) },
        name: { type: new GraphQLNonNull(GraphQLString) },
        lastname: { type: new GraphQLNonNull(GraphQLString) },
        email: { type: new GraphQLNonNull(GraphQLString) },
        password: { type: new GraphQLNonNull(GraphQLString) },
        phone: { type: GraphQLString },
        address: { type: GraphQLString }
    },
    async resolve(parent, args) {
        return new Promise((resolve, reject) => {
            modelUser.findOneAndUpdate({ "_id": mongoose.Types.ObjectId(args.id) }, { "$set": args }, { new: true }).exec((err, resp) => {
                if (err) reject(new ApolloError("Bad Request", "400"));
                else resolve(resp);
            });
        });
    }
};

module.exports = {
    addUser,
    editUser
};