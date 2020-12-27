require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const {
    ApolloServer,
    AuthenticationError,
    ForbiddenError,
    SchemaError,
    UserInputError,
    ValidationError,
    ApolloError
} = require('apollo-server-express');
const expressPlayGround = require('graphql-playground-middleware-express').default;
const { graphqlUploadExpress } = require('graphql-upload');
const { mkdir } = require('fs');
const path = require('path');
const { config } = require('./config');
const schema = require('./schema');

// MongoConnection
const mongoConnection = require('./db/db');
mongoConnection.connection();

const server = new ApolloServer({
    schema,
    // introspection: process.env.NODE_ENV !== 'production',
    introspection: true,
    playground: true,
    tracing: true,
    uploads: false,
    formatError: (err) => ({

        message: err.message,
        code: err.extensions.code,
        stack: (process.env.NODE_ENV === 'production') ? 'PRODUCTION' : err.extensions.exception.stacktrace
    }),
    context: req => ({...req }),
});

// Routes
var tokenRouter = require('./util/routes/token');
const { extensions } = require('./schema/query');

mkdir(config.imageEstablishment, { recursive: true }, (err) => {
    if (err) throw err;
});

const app = express();
app.use(graphqlUploadExpress({ maxFieldSize: 10000000, maxFiles: 5 }));
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
app.use(config.imageEstablishment, express.static(__dirname + config.imageEstablishment));
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