const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const config = require('./config');

class Database {
  constructor() {
    this.dbFile = config.DB_FILE;
    this.db = new sqlite3.Database(this.dbFile, (err) => {
      if (err) {
        console.error('Database connection error:', err);
      } else if (config.LOG_LEVEL === 'debug') {
        console.log('Database connected');
      }
    });
    this.init();
  }

  init() {
    const schema = fs.readFileSync(config.DB_SCHEMA, 'utf8');
    this.db.exec(schema, (err) => {
      if (err) {
        console.error('initialisation de la base de donnée a echouer:', err);
      } else if (config.LOG_LEVEL === 'debug') {
        console.log('initialisation de la base de donnée');
      }
    });
  }

  async run(query, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(query, params, function (err) {
        if (err) return reject(err);
        resolve(this);
      });
    });
  }

  async get(query, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(query, params, (err, row) => {
        if (err) return reject(err);
        resolve(row);
      });
    });
  }

  async all(query, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(query, params, (err, rows) => {
        if (err) return reject(err);
        resolve(rows);
      });
    });
  }
}

module.exports = new Database();