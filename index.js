const express = require('express');
const { createServer } = require('http');
const cors = require('cors');
const { ApolloServer } = require('apollo-server-express');
const { config } = require('./config');
const schema = require('./schema/schema');
const app = express();
const mongoConnect = require('./db/db');

// Middlewares
// const notFoundHandler = require('./utils/middleware/notFoundHandler');

app.use(express.json());
app.use('*', cors());

//Catch 404
// app.use(notFoundHandler);

const server = new ApolloServer({
    schema,
    introspection: true,
    formatError: (err) => { // Don't give the specific errors to the client.
        // if (err.message.startsWith("Database Error: ")) {
        //     return new Error('Internal server error');
        // }

        if (err.message.includes("duplicate key")) {
            return ({ message: 'Duplicate Key Error ' + err.message, statusCode: 409 });
        }

        if (err.message.includes("ObjectId failed")) {
            return ({ message: 'ObjectId is not valid ' + err.message, statusCode: 409 });
        }

        return ({ message: err.message, statusCode: err.extensions.exception.code });
    }
});

server.applyMiddleware({ app });

const httpServer = createServer(app);

httpServer.listen(config.appPort, () => {
    console.log(`Deployed Server in http://localhost:${config.appPort}/`);
});