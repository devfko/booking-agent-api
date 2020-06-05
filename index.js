require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const path = require('path');
const { ApolloServer } = require('apollo-server-express');
const { config } = require('./config');
const schema = require('./schema');
const expressPlayGround = require('graphql-playground-middleware-express').default;
const app = express();
const mongoConnect = require('./db/db');

app.use(express.json());
app.use('*', cors());
app.use(express.static(path.join(__dirname, 'public')));

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

app.get('*', (req, resp) => {
    resp.sendFile(path.resolve(__dirname, 'public', 'index.js'));
});

var port = normalizePort(process.env.PORT || process.env.URL_PORT);
app.set('port', port);
var httpServer = http.createServer(app);

httpServer.listen(port, () => {

    console.log(`Deployed Server in ${config.appURL}` + (config.appPort ? ':' + config.appPort + '/' : ''));
});

function normalizePort(val) {
    var port = parseInt(val, 10);

    if (isNaN(port)) {
        // named pipe
        return val;
    }

    if (port >= 0) {
        // port number
        return port;
    }

    return false;
}

// TODO: Implementar proceso de subida/modificación de logo del establecimiento