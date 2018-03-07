const sqlite = require('sqlite3');

class Db {
  /**
   * Сохранить что-то в БД
   */
  async store(table, data) {
    let fields = [];
    var values = [];

    for (let f in data) {
      fields.push(f);
      values.push(data[f]);
    }

    return new Promise((resolve, reject) => {
      this.db.run(
        'INSERT INTO ' +
          table +
          ' (' +
          fields.join(',') +
          ') VALUES (' +
          fields.map(f => '?').join(',') +
          ')',
        values,
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

  /**
   * Получить запись из БД по id
   */
  async get(table, id) {
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT * FROM ' + table + ' WHERE id = ?',
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
      // Сообщения мини-чата
      this.db.run(`CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY,
        text TEXT,
        user_id INTEGER,
        user_name TEXT
      )`);

      // Посты форума
      this.db.run(`CREATE TABLE IF NOT EXISTS forum_posts (
        id INTEGER PRIMARY KEY,
        url TEXT,
        thread TEXT,
        username TEXT,
        html TEXT
      )`);

      // Новости
      this.db.run(`CREATE TABLE IF NOT EXISTS news (
        id TEXT PRIMARY KEY,
        title TEXT,
        author TEXT,
        html TEXT
      )`);
    });
  }
}

module.exports = new Db();
