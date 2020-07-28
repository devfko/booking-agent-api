require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { https } = require('http');
const path = require('path');
const { ApolloServer } = require('apollo-server-express');
const { config } = require('./config');
const schema = require('./schema');
const expressPlayGround = require('graphql-playground-middleware-express').default;

// MongoConnection
const mongoConnection = require('./db/db');
mongoConnection.connection();

const server = new ApolloServer({
    schema,
    introspection: process.env.NODE_ENV !== 'production',
    playground: true,
    tracing: true,
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

// Routes
var tokenRouter = require('./util/routes/token');

const app = express();
app.use(helmet());
app.use(express.json());

if (process.env.NODE_ENV === 'production') {
    app.use(rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100, // limit each IP to 100 requests per windowMs
    }));
}

app.use('*', cors());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/token', tokenRouter);

app.get('/', function(req, resp) {
    return resp.status(200).json({
        message: 'API GraphQL',
        author: '@devfko <proyectosevfko@gmailcom>',
        url_main: `${config.appURL}` + (process.env.NODE_ENV !== 'production' ? ':' + config.appPort : '') + `/graphql`
    });
});

server.applyMiddleware({ app });
app.get('/', expressPlayGround({
    endpoint: '/graphql'
}));

var port = normalizePort(process.env.PORT || process.env.URL_PORT);
app.set('port', port);
const httpServer = http.createServer(app);
server.installSubscriptionHandlers(httpServer);

httpServer.listen(port, () => {

    console.log(`Deployed Server in ${config.appURL}` + (config.appPort ? ':' + config.appPort + '/' : ''));
    console.log(`🚀 Subscriptions ready at ws://localhost:${port}${server.subscriptionsPath}`);

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