const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Connect to SQLite database
const dbPath = path.resolve(process.cwd(), 'database/billing.db');
const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Run schema initialisation
const schemaPath = path.resolve(process.cwd(), 'database/schema.sql');
const schema = fs.readFileSync(schemaPath, 'utf8');
db.exec(schema);

module.exports = db;
