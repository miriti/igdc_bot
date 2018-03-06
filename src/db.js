const sqlite = require('sqlite3');

class Db {
  async storeMessage(id, text, user_id, user_name) {
    return new Promise((resolve, reject) => {
      this.db.run(
        `INSERT INTO messages (id, text, user_id, user_name)
      VALUES (?, ?, ?, ?)`,
        id,
        text,
        user_id,
        user_name,
        (err, result) => {
          if (!err) {
            resolve(result);
          } else {
            reject(err);
          }
        },
      );
    });
  }

  async getMessage(id) {
    return new Promise((resolve, reject) => {
      this.db.get('SELECT * FROM messages WHERE id = ?', id, (err, result) => {
        if (!err) {
          resolve(result);
        } else {
          reject(err);
        }
      });
    });
  }

  async storeForumPost(data) {
    return new Promise((resolve, reject) => {
      this.db.run(
        `INSERT INTO forum_posts (id, url, thread, username, html)
      VALUES (?, ?, ?, ?, ?)`,
        data['id'],
        data['url'],
        data['thread'],
        data['username'],
        data['html'],
        (err, result) => {
          if (!err) {
            resolve(result);
          } else {
            reject(err);
          }
        },
      );
    });
  }

  async getForumPost(id) {
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT * FROM forum_posts WHERE id = ?',
        id,
        (err, result) => {
          if (!err) {
            resolve(result);
          } else {
            reject(err);
          }
        },
      );
    });
  }

  constructor() {
    this.db = new sqlite.Database('data.db');
    this.db.serialize(() => {
      this.db.run(`CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY,
        text TEXT,
        user_id INTEGER,
        user_name TEXT
      )`);

      this.db.run(`CREATE TABLE IF NOT EXISTS forum_posts (
        id INTEGER PRIMARY KEY,
        url TEXT,
        thread TEXT,
        username TEXT,
        html TEXT
      )`);
    });
  }
}

module.exports = new Db();
