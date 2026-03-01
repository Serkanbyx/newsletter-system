const { getDatabase } = require("../config/database");

class Subscriber {
  static findAll(onlyActive = true) {
    const db = getDatabase();
    const query = onlyActive
      ? "SELECT id, email, name, is_active, subscribed_at FROM subscribers WHERE is_active = 1 ORDER BY subscribed_at DESC"
      : "SELECT id, email, name, is_active, subscribed_at, unsubscribed_at FROM subscribers ORDER BY subscribed_at DESC";
    return db.prepare(query).all();
  }

  static findByEmail(email) {
    const db = getDatabase();
    return db
      .prepare("SELECT * FROM subscribers WHERE email = ?")
      .get(email);
  }

  static findByToken(token) {
    const db = getDatabase();
    return db
      .prepare("SELECT * FROM subscribers WHERE token = ?")
      .get(token);
  }

  static findById(id) {
    const db = getDatabase();
    return db.prepare("SELECT * FROM subscribers WHERE id = ?").get(id);
  }

  static create({ email, name, token }) {
    const db = getDatabase();
    const stmt = db.prepare(
      "INSERT INTO subscribers (email, name, token) VALUES (?, ?, ?)"
    );
    const result = stmt.run(email, name, token);
    return this.findById(result.lastInsertRowid);
  }

  static reactivate(id) {
    const db = getDatabase();
    db.prepare(
      "UPDATE subscribers SET is_active = 1, unsubscribed_at = NULL WHERE id = ?"
    ).run(id);
    return this.findById(id);
  }

  static deactivate(token) {
    const db = getDatabase();
    const result = db
      .prepare(
        "UPDATE subscribers SET is_active = 0, unsubscribed_at = datetime('now') WHERE token = ? AND is_active = 1"
      )
      .run(token);
    return result.changes > 0;
  }

  static countActive() {
    const db = getDatabase();
    return db
      .prepare("SELECT COUNT(*) as count FROM subscribers WHERE is_active = 1")
      .get().count;
  }
}

module.exports = Subscriber;
