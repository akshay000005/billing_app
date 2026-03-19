-- ===== EXISTING TABLES =====

CREATE TABLE IF NOT EXISTS customers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    custom_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    gst_in TEXT,
    address TEXT
);

CREATE TABLE IF NOT EXISTS items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    rate REAL NOT NULL,
    gst_rate REAL NOT NULL
);

CREATE TABLE IF NOT EXISTS bills (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    bill_number TEXT UNIQUE NOT NULL,
    customer_id INTEGER NOT NULL,
    date TEXT NOT NULL,
    subtotal REAL NOT NULL,
    cgst REAL NOT NULL,
    sgst REAL NOT NULL,
    igst REAL NOT NULL,
    total REAL NOT NULL,
    status TEXT DEFAULT 'unpaid',
    template TEXT DEFAULT 'default',
    FOREIGN KEY(customer_id) REFERENCES customers(id)
);

CREATE TABLE IF NOT EXISTS bill_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    bill_id INTEGER NOT NULL,
    item_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    rate REAL NOT NULL,
    amount REAL NOT NULL,
    FOREIGN KEY(bill_id) REFERENCES bills(id),
    FOREIGN KEY(item_id) REFERENCES items(id)
);

-- ===== ACCOUNTING TABLES =====

CREATE TABLE IF NOT EXISTS accounts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('Asset','Liability','Equity','Income','Expense')),
    description TEXT,
    is_system INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS journal_entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    reference TEXT,
    description TEXT NOT NULL,
    narration TEXT,
    source TEXT DEFAULT 'manual',
    source_id INTEGER
);

CREATE TABLE IF NOT EXISTS journal_lines (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    entry_id INTEGER NOT NULL,
    account_id INTEGER NOT NULL,
    debit REAL DEFAULT 0,
    credit REAL DEFAULT 0,
    description TEXT,
    FOREIGN KEY(entry_id) REFERENCES journal_entries(id),
    FOREIGN KEY(account_id) REFERENCES accounts(id)
);

CREATE TABLE IF NOT EXISTS vendors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    custom_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    gstin TEXT,
    address TEXT,
    opening_balance REAL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS purchases (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    purchase_number TEXT UNIQUE NOT NULL,
    vendor_id INTEGER NOT NULL,
    date TEXT NOT NULL,
    due_date TEXT,
    subtotal REAL NOT NULL,
    cgst REAL DEFAULT 0,
    sgst REAL DEFAULT 0,
    igst REAL DEFAULT 0,
    total REAL NOT NULL,
    status TEXT DEFAULT 'unpaid',
    notes TEXT,
    FOREIGN KEY(vendor_id) REFERENCES vendors(id)
);

CREATE TABLE IF NOT EXISTS purchase_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    purchase_id INTEGER NOT NULL,
    item_name TEXT NOT NULL,
    quantity REAL NOT NULL,
    rate REAL NOT NULL,
    gst_rate REAL DEFAULT 0,
    amount REAL NOT NULL,
    FOREIGN KEY(purchase_id) REFERENCES purchases(id)
);

CREATE TABLE IF NOT EXISTS expenses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    amount REAL NOT NULL,
    vendor_id INTEGER,
    payment_mode TEXT DEFAULT 'cash',
    reference TEXT,
    FOREIGN KEY(vendor_id) REFERENCES vendors(id)
);

CREATE TABLE IF NOT EXISTS payments_received (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    bill_id INTEGER NOT NULL,
    customer_id INTEGER NOT NULL,
    amount REAL NOT NULL,
    payment_mode TEXT DEFAULT 'cash',
    reference TEXT,
    notes TEXT,
    FOREIGN KEY(bill_id) REFERENCES bills(id),
    FOREIGN KEY(customer_id) REFERENCES customers(id)
);

CREATE TABLE IF NOT EXISTS payments_made (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    purchase_id INTEGER,
    vendor_id INTEGER,
    amount REAL NOT NULL,
    payment_mode TEXT DEFAULT 'cash',
    reference TEXT,
    notes TEXT,
    FOREIGN KEY(purchase_id) REFERENCES purchases(id),
    FOREIGN KEY(vendor_id) REFERENCES vendors(id)
);

-- Default Chart of Accounts (seeded once)
INSERT OR IGNORE INTO accounts (code, name, type, description, is_system) VALUES
('1001', 'Cash',                  'Asset',    'Cash on hand',                     1),
('1002', 'Bank Account',          'Asset',    'Primary bank account',              1),
('1100', 'Accounts Receivable',   'Asset',    'Money owed by customers',           1),
('1200', 'Inventory',             'Asset',    'Stock of goods',                    1),
('1300', 'Other Current Assets',  'Asset',    'Prepaid expenses and other assets', 0),
('2001', 'Accounts Payable',      'Liability','Money owed to vendors',             1),
('2100', 'GST Payable',           'Liability','GST collected on sales',            1),
('2200', 'GST Receivable',        'Asset',    'GST paid on purchases (ITC)',       1),
('2300', 'Other Liabilities',     'Liability','Other short-term liabilities',      0),
('3001', 'Owner Equity',          'Equity',   'Capital contributed by owners',     1),
('3100', 'Retained Earnings',     'Equity',   'Accumulated profits/losses',        1),
('4001', 'Sales Revenue',         'Income',   'Revenue from sales',                1),
('4100', 'Other Income',          'Income',   'Miscellaneous income',              0),
('5001', 'Cost of Goods Sold',    'Expense',  'Direct cost of goods sold',         1),
('5100', 'Salaries & Wages',      'Expense',  'Employee salaries',                 0),
('5200', 'Rent',                  'Expense',  'Office/shop rent',                  0),
('5300', 'Utilities',             'Expense',  'Electricity, water, internet',      0),
('5400', 'Office Supplies',       'Expense',  'Stationery and supplies',           0),
('5500', 'Travel & Transport',    'Expense',  'Business travel expenses',          0),
('5600', 'Marketing & Advertising','Expense', 'Advertising costs',                0),
('5700', 'Professional Fees',     'Expense',  'Legal, accounting fees',            0),
('5800', 'Depreciation',          'Expense',  'Asset depreciation',                0),
('5900', 'Miscellaneous Expense', 'Expense',  'Other business expenses',           0);
