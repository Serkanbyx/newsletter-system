const { getDatabase } = require("../config/database");

class Newsletter {
  static findAll() {
    const db = getDatabase();
    return db
      .prepare("SELECT * FROM newsletters ORDER BY created_at DESC")
      .all();
  }

  static findById(id) {
    const db = getDatabase();
    return db.prepare("SELECT * FROM newsletters WHERE id = ?").get(id);
  }

  static create({ subject, content }) {
    const db = getDatabase();
    const result = db
      .prepare("INSERT INTO newsletters (subject, content) VALUES (?, ?)")
      .run(subject, content);
    return this.findById(result.lastInsertRowid);
  }

  static update(id, { subject, content }) {
    const db = getDatabase();
    db.prepare(
      "UPDATE newsletters SET subject = ?, content = ? WHERE id = ? AND status = 'draft'"
    ).run(subject, content, id);
    return this.findById(id);
  }

  static delete(id) {
    const db = getDatabase();
    const result = db
      .prepare("DELETE FROM newsletters WHERE id = ? AND status = 'draft'")
      .run(id);
    return result.changes > 0;
  }

  static schedule(id, scheduledAt) {
    const db = getDatabase();
    db.prepare(
      "UPDATE newsletters SET status = 'scheduled', scheduled_at = ? WHERE id = ? AND status = 'draft'"
    ).run(scheduledAt, id);
    return this.findById(id);
  }

  static markAsSending(id) {
    const db = getDatabase();
    db.prepare(
      "UPDATE newsletters SET status = 'sending' WHERE id = ?"
    ).run(id);
  }

  static markAsSent(id) {
    const db = getDatabase();
    db.prepare(
      "UPDATE newsletters SET status = 'sent', sent_at = datetime('now') WHERE id = ?"
    ).run(id);
  }

  static markAsFailed(id) {
    const db = getDatabase();
    db.prepare(
      "UPDATE newsletters SET status = 'failed' WHERE id = ?"
    ).run(id);
  }

  static findScheduledReady() {
    const db = getDatabase();
    return db
      .prepare(
        "SELECT * FROM newsletters WHERE status = 'scheduled' AND scheduled_at <= datetime('now')"
      )
      .all();
  }

  static getLogs(newsletterId) {
    const db = getDatabase();
    return db
      .prepare(
        `SELECT sl.*, s.email, s.name 
         FROM send_logs sl 
         JOIN subscribers s ON sl.subscriber_id = s.id 
         WHERE sl.newsletter_id = ? 
         ORDER BY sl.sent_at DESC`
      )
      .all(newsletterId);
  }

  static addLog({ newsletterId, subscriberId, status, errorMessage = null }) {
    const db = getDatabase();
    db.prepare(
      "INSERT INTO send_logs (newsletter_id, subscriber_id, status, error_message) VALUES (?, ?, ?, ?)"
    ).run(newsletterId, subscriberId, status, errorMessage);
  }

  static countByStatus() {
    const db = getDatabase();
    const rows = db
      .prepare("SELECT status, COUNT(*) as count FROM newsletters GROUP BY status")
      .all();
    return rows.reduce((acc, row) => ({ ...acc, [row.status]: row.count }), {});
  }
}

module.exports = Newsletter;
