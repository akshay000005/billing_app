const db = require('./db.js');
const fs = require('fs');
const path = require('path');

const schemaPath = path.resolve(__dirname, 'schema.sql');
const schema = fs.readFileSync(schemaPath, 'utf8');

db.exec(schema);
console.log("Database initialized successfully.");
