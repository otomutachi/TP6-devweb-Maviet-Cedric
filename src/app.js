const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const path = require('path');
const yaml = require('js-yaml');
const fs = require('fs');

const app = express();

const originURL = "https://tp6-devweb-maviet-cedric.onrender.com/";

app.use(cors());
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));

app.use(express.static(path.join(__dirname, '../static')));
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

app.disable('x-powered-by');
app.use((req, res, next) => {
  res.setHeader('X-API-Version', '2.0.1'); 
  next();
});

app.get('/favicon.ico', (req, res) => {
  res.sendFile(path.join(__dirname, '../static/logo_univ_16.png'));
});

app.use('/api-v1', require('./routes/api-v1'));
app.use('/api-v2', require('./routes/api-v2'));

const swaggerDocument = yaml.load(fs.readFileSync(path.join(__dirname, '../static/open-api.yaml'), 'utf8'));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));


const db = require('./utils/database');
app.get('/:short', async (req, res) => {
  try {
    const row = await db.get('SELECT origin, visits FROM links WHERE short = ?', [req.params.short]);
    if (!row) {
      return res.status(404).send('Short URL not found');
    }
    await db.run('UPDATE links SET visits = visits + 1 WHERE short = ?', [req.params.short]);
    res.redirect(302, row.origin);
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal server error');
  }
});

module.exports = app;