require('dotenv').config();

const config = {
  PORT: process.env.PORT || 8080,
  LINK_LEN: parseInt(process.env.LINK_LEN, 10) || 6,
  DB_FILE: process.env.DB_FILE,
  DB_SCHEMA: process.env.DB_SCHEMA,
  NODE_ENV: process.env.NODE_ENV || 'development',
  LOG_LEVEL: process.env.NODE_ENV === 'development' ? 'debug' : 'info'
};

module.exports = config;