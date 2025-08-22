import Database from "better-sqlite3";
export const db = new Database("ecommerce.sqlite");

db.exec(`
PRAGMA journal_mode = WAL;
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  address_json TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS login_codes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  used INTEGER DEFAULT 0
);
CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY,
  title TEXT NOT NULL,
  price REAL NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  data_json TEXT
);
CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  product_id INTEGER NOT NULL,
  status TEXT NOT NULL,
  mp_preference_id TEXT,
  mp_init_point TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY(user_id) REFERENCES users(id),
  FOREIGN KEY(product_id) REFERENCES products(id)
);
`);
const count = db.prepare("SELECT COUNT(*) as c FROM products").get() as { c: number };
if (count.c === 0) {
  const seed = db.prepare("INSERT INTO products (id,title,price,stock,data_json) VALUES (?,?,?,?,?)");
  seed.run(1, "Laptop X1", 999.99, 5, JSON.stringify({ category: "tech" }));
  seed.run(2, "Silla ergonómica", 189.00, 12, JSON.stringify({ category: "muebles" }));
  seed.run(3, "Monitor 27\"", 219.00, 8, JSON.stringify({ category: "tech" }));
  seed.run(4, "Auriculares Pro", 129.00, 20, JSON.stringify({ category: "tech" }));
}
