const express = require('express');
const swaggerUi = require('swagger-ui-express');
const path = require('path');

const app = express();

app.disable('x-powered-by');
app.use((req, res, next) => {
    res.setHeader('X-API-Version', '1.0.0'); 
    next();
});
app.get('/favicon.ico', (req, res) => {
    res.sendFile(path.join(__dirname, '../static/logo_univ_16.png'));
});

app.use(express.json());
app.use('/api-v1', require('./routes/api-v1'));

const swaggerDocument = require('../static/open-api.json');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

module.exports = app;