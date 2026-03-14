const Database = require('better-sqlite3');
const path = require('path');

// Connect to SQLite database
const dbPath = path.resolve(process.cwd(), 'database/billing.db');
const db = new Database(dbPath, { verbose: console.log });
db.pragma('journal_mode = WAL');

module.exports = db;
