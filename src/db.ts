import sqlite from 'sqlite3';

const DB_FILE_PATH = process.env['DB_FILE_PATH'] || './data/data.db';

class Db {
  private db: sqlite.Database;

  /**
   * Сохранить что-то в БД
   */
  async store(table: string, data: { [key: string]: any }) {
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
          fields.map((f) => '?').join(',') +
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
  async get(table: string, id: number) {
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
    this.db = new sqlite.Database(DB_FILE_PATH);

    this.db.serialize(() => {
      // Сообщения мини-чата
      this.db.run(`CREATE TABLE IF NOT EXISTS chat (
        id INTEGER PRIMARY KEY
      )`);

      // Посты форума
      this.db.run(`CREATE TABLE IF NOT EXISTS forum (
        id INTEGER PRIMARY KEY
      )`);

      // Новости
      this.db.run(`CREATE TABLE IF NOT EXISTS news (
        id INTEGER PRIMARY KEY
      )`);
    });
  }
}

const db = new Db();

export default db;
