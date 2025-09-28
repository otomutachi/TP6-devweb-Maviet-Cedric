const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

class Database {
    constructor() {
        this.dbFile = process.env.DB_FILE;
        this.db = new sqlite3.Database(this.dbFile, (err) => {
            if (err) {
                console.error('Database connection error:', err);
            }
        });
        this.init();
    }

    init() {
        const schema = fs.readFileSync(process.env.DB_SCHEMA, 'utf8');
        this.db.exec(schema, (err) => {
            if (err) {
                console.error('Error initializing database:', err);
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