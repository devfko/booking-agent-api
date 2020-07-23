const graphql = require('graphql');
const typeDefs = require('../types/typeQueries');
const mongoose = require('mongoose');

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { config } = require('../../config');

const {
    GraphQLString,
    GraphQLNonNull,
    GraphQLID,
    GraphQLBoolean,
    GraphQLInt,
    GraphQLFloat
} = graphql;

const modelCommEstablishment = mongoose.model('Commercial_Establishment');

const addCommercialEstablishment = {
    type: typeDefs.CommercialEstablishmentType,
    description: 'Creación de Establecimientos Comerciales',
    args: {
        name: { type: GraphQLNonNull(GraphQLString) },
        email: { type: GraphQLNonNull(GraphQLString) },
        password: { type: GraphQLNonNull(GraphQLString) },
        address: { type: GraphQLNonNull(GraphQLString) },
        description: { type: GraphQLString },
        logo: { type: GraphQLString },
        phone: { type: GraphQLString },
        active: { type: GraphQLBoolean },
        capacity: { type: GraphQLInt },
        rating: { type: GraphQLFloat },
        cityID: {
            type: new GraphQLNonNull(GraphQLID),
            description: 'ID de la Ciudad relacionada'
        },
        categoryID: {
            type: new GraphQLNonNull(GraphQLID),
            description: 'ID de la Categoria del Establecimiento'
        }
    },
    async resolve(parent, args) {

        let establishment = new modelCommEstablishment({
            ...args
        });

        try {
            return establishment.save();
        } catch (err) {
            console.log(err);
        }
    }
};

const editCommercialEstablishment = {
    type: typeDefs.CommercialEstablishmentType,
    description: 'Modificación de Establecimientos Comerciales',
    args: {
        id: { type: GraphQLNonNull(GraphQLID) },
        name: { type: GraphQLNonNull(GraphQLString) },
        email: { type: GraphQLNonNull(GraphQLString) },
        password: { type: GraphQLNonNull(GraphQLString) },
        address: { type: GraphQLNonNull(GraphQLString) },
        description: { type: GraphQLString },
        logo: { type: GraphQLString },
        phone: { type: GraphQLString },
        active: { type: GraphQLBoolean },
        capacity: { type: GraphQLInt },
        rating: { type: GraphQLFloat },
        cityID: {
            type: new GraphQLNonNull(GraphQLID),
            description: 'ID de la Ciudad relacionada'
        },
        categoryID: {
            type: new GraphQLNonNull(GraphQLID),
            description: 'ID de la Categoria del Establecimiento'
        }
    },
    async resolve(parent, args) {
        return new Promise((resolve, reject) => {
            modelCommEstablishment.findOneAndUpdate({ "_id": mongoose.Types.ObjectId(args.id) }, { "$set": args }, { new: true }).exec((err, resp) => {
                if (err) reject(err);
                else resolve(resp);
            });
        });
    }
};

const loginCommercialEstablishment = {
    type: typeDefs.CommercialLogin,
    description: 'Login Establecimientos Comerciales',
    args: {
        email: { type: new GraphQLNonNull(GraphQLString) },
        password: { type: new GraphQLNonNull(GraphQLString) }
    },
    async resolve(parent, args) {

        let user = await modelCommEstablishment.find({ email: args.email });

        if (user.length) {

            let userFinded = await bcrypt.compareSync(args.password, user[0].password);

            if (userFinded) {
                const token = jwt.sign({ _id: user[0]._id, email: user[0].email }, config.loginToken, { expiresIn: '1d' });

                return { establishment: user[0].name, token };
            }
        }

        return { establishment: 'Usuario y/o Password no válido', token: "" };

    }
};

module.exports = {
    addCommercialEstablishment,
    editCommercialEstablishment,
    loginCommercialEstablishment
};