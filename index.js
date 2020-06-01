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
    playground: true,
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

const PORT = config.appPort || 3000;
httpServer.listen(PORT, '0.0.0.0', () => {
    console.log('port : ' + PORT);

    console.log('Server obtained : ' + httpServer.address());

    console.log(`Deployed Server in ${config.appURL}` + (config.appPort ? ':' + config.appPort + '/' : ''));
});

// TODO: Implementar proceso de subida/modificación de logo del establecimiento