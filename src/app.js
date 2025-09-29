const express = require('express');
const swaggerUi = require('swagger-ui-express');
const path = require('path');
const yaml = require('js-yaml');
const fs = require('fs');

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));

app.use(express.static(path.join(__dirname, '../static')));
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse form data

app.disable('x-powered-by');
app.use((req, res, next) => {
  res.setHeader('X-API-Version', '2.0.1'); // Updated to match OpenAPI version
  next();
});

app.get('/favicon.ico', (req, res) => {
  res.sendFile(path.join(__dirname, '../static/logo_univ_16.png'));
});

app.use('/api-v1', require('./routes/api-v1'));
app.use('/api-v2', require('./routes/api-v2'));

const swaggerDocument = yaml.load(fs.readFileSync(path.join(__dirname, '../static/open-api.yaml'), 'utf8'));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

module.exports = app;