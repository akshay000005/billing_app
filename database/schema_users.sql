-- Users table for role-based access
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'employee' CHECK(role IN ('admin','manager','employee','auditor')),
    pin TEXT NOT NULL DEFAULT '0000',
    avatar_color TEXT DEFAULT '#00f5ff',
    is_active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now'))
);

-- Default admin user
INSERT OR IGNORE INTO users (id, name, role, pin, avatar_color) VALUES
(1, 'Admin', 'admin', '1234', '#f43f5e');
