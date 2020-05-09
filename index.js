const express = require('express');
const cors = require('cors');
const { config } = require('./config');
const app = express();

// Routes
const countryRoutes = require('./routes/countries');

// Middlewares
const notFoundHandler = require('./utils/middleware/notFoundHandler');

app.use(express.json());
app.use(cors());

// Called of Routes
countryRoutes(app);

//Catch 404
app.use(notFoundHandler);

app.listen(config.appPort, () => {
    console.log(`Deployed Server in http://localhost:${config.appPort}/`);
});