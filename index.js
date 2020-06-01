const express = require('express');
const { createServer } = require('http');
const cors = require('cors');
const { ApolloServer } = require('apollo-server-express');
const { config } = require('./config');
const schema = require('./schema');
const expressPlayGround = require('graphql-playground-middleware-express').default;
const app = express();
const mongoConnect = require('./db/db');

app.use(express.json());
app.use('*', cors());

var tokenRouter = require('./util/routes/token');

const server = new ApolloServer({
    schema,
    introspection: true,
    formatError: (err) => {

        if (err.message.includes("validation failed")) {
            return ({ message: err.message, statusCode: 409 });
        }

        if (err.message.includes("ObjectId failed")) {
            return ({ message: 'Clave Primaria no es válida : ' + err.message, statusCode: 409 });
        }

        return ({ message: err.message, statusCode: 500 });
    }
});

server.applyMiddleware({ app });

app.use('/token', tokenRouter);

app.get('/', expressPlayGround({
    endpoint: '/graphql'
}));

const httpServer = createServer(app);

httpServer.listen(config.appPort, () => {
    console.log(`Deployed Server in ${config.appURL}:${config.appPort}/`);
});

// TODO: Implementar proceso de subida/modificación de logo del establecimiento