const express = require('express');
const { createServer } = require('http');
const cors = require('cors');
const { ApolloServer } = require('apollo-server-express');
const { config } = require('./config');
const schema = require('./schema/schema');
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
        // Don't give the specific errors to the client.
        // if (err.message.startsWith("Database Error: ")) {
        //     return new Error('Internal server error');
        // }

        if (err.message.includes("duplicate key")) {
            return ({ message: 'Duplicate Key Error ' + err.message, statusCode: 409 });
        }

        if (err.message.includes("ObjectId failed")) {
            return ({ message: 'ObjectId is not valid ' + err.message, statusCode: 409 });
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
    console.log(`Deployed Server in http://localhost:${config.appPort}/`);
});

// TODO: Implementar proceso de subida/modificación de logo del establecimiento