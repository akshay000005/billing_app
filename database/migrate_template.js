const db = require('./db.js');

try {
  db.exec(`
    ALTER TABLE settings ADD COLUMN invoice_template TEXT DEFAULT 'professional';
    ALTER TABLE settings ADD COLUMN theme_color TEXT DEFAULT '#2563eb';
  `);
  console.log("Migration for template and theme color complete");
} catch (e) {
  if (e.message.includes('duplicate column name')) {
     console.log("Columns already exist, skipping migration");
  } else {
     console.error("Migration error:", e);
  }
}
