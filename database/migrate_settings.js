const db = require('./db.js');

db.exec(`
CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    company_name TEXT NOT NULL,
    company_address TEXT,
    gstin TEXT,
    phone TEXT,
    email TEXT
);
INSERT INTO settings (id, company_name, company_address, gstin, phone, email) 
VALUES (1, 'Your Company Name Ltd.', '123 Business Avenue, Tech Park\\nCity, State 12345', '22AAAAA0000A1Z5', '123-456-7890', 'contact@company.com')
ON CONFLICT(id) DO NOTHING;
`);
console.log("Migration for settings table complete");
