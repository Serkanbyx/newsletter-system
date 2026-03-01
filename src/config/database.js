const Database = require("better-sqlite3");
const path = require("path");

const DB_PATH = path.join(__dirname, "../../newsletter.db");

let db;

const getDatabase = () => {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma("journal_mode = WAL");
    db.pragma("foreign_keys = ON");
    initializeTables();
  }
  return db;
};

const initializeTables = () => {
  db.exec(`
    CREATE TABLE IF NOT EXISTS subscribers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      token TEXT UNIQUE NOT NULL,
      is_active INTEGER DEFAULT 1,
      subscribed_at TEXT DEFAULT (datetime('now')),
      unsubscribed_at TEXT
    );

    CREATE TABLE IF NOT EXISTS newsletters (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      subject TEXT NOT NULL,
      content TEXT NOT NULL,
      status TEXT DEFAULT 'draft' CHECK(status IN ('draft', 'scheduled', 'sending', 'sent', 'failed')),
      scheduled_at TEXT,
      sent_at TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS send_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      newsletter_id INTEGER NOT NULL,
      subscriber_id INTEGER NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('sent', 'failed')),
      error_message TEXT,
      sent_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (newsletter_id) REFERENCES newsletters(id) ON DELETE CASCADE,
      FOREIGN KEY (subscriber_id) REFERENCES subscribers(id) ON DELETE CASCADE
    );
  `);
};

module.exports = { getDatabase };
