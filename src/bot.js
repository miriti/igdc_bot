const TelegramAPI = require('./api');
const fetch = require('node-fetch');
const db = require('./db');
const forum = require('./forum');
const news = require('./news');

module.exports = class Bot {
  /**
   * Получаем и отпарвляем сообщения из чата
   *
   * @param {Array<String>} to Список каналов для отправки
   */
  async fetchShoutbox(to) {
    let response = await fetch(
      'http://igdc.ru/infusions/shoutbox_panel/shoutbox.php',
    ).then(r => r.json());

    for (let msg of response['messages']) {
      const exists = await db.get('chat', msg['id']);

      if (!exists) {
        await db.store('chat', {
          id: msg['id'],
        });

        const chatMessage =
          '<a href="http://igdc.ru/infusions/shoutbox_panel/shoutbox_archive.php">Мини-чат</a>' +
          '\n' +
          '<b>' +
          msg['user']['name'].trim() +
          '</b>: ' +
          msg['text'];

        for (let chan of to) {
          await this.api.sendMessage(chan, chatMessage);
        }
      }
    }
  }

  /**
   * Получаем и отпарвляем новости
   *
   * @param {Array<String>} to Список каналов для отправки
   */
  async fetchNews(to) {
    const allNews = await news.getNews();

    for (let newsItem of allNews) {
      const exists = await db.get('news', newsItem['id']);

      if (!exists) {
        await db.store('news', { id: newsItem['id'] });

        const channelMessage =
          '<b>' +
          newsItem['title'] +
          '</b>\n' +
          newsItem['html'] +
          '\n\n<i>' +
          newsItem['author'] +
          '</i>';

        for (let chan of to) {
          await this.api.sendMessage(chan, channelMessage);
        }
      }
    }
  }

  /**
   * Получаем и отпарвляем последнее сообщение форума
   *
   * @param {Array<String>} to Список каналов для отправки
   */
  async fetchForum(to) {
    const lastPost = await forum.getLastMessage();

    const existing = await db.get('forum', lastPost['id']);

    if (!existing) {
      db.store('forum', { id: lastPost['id'] });

      const chatMessage =
        '<a href="' +
        lastPost['url'] +
        '">' +
        lastPost['thread'] +
        '</a>\n<b>' +
        lastPost['username'] +
        ':' +
        '</b>\n' +
        lastPost['html'];

      for (let chan of to) {
        this.api.sendMessage(chan, chatMessage);
      }
    }
  }

  constructor(token) {
    this.api = new TelegramAPI(token);
  }
};
