const TelegramAPI = require('./api');
const fetch = require('node-fetch');
const db = require('./db');
const forum = require('./forum');
const news = require('./news');
const striptags = require('striptags');

module.exports = class Bot {
  /**
   * Получаем и отпарвляем сообщения из чата
   *
   * @param {Array<String>} to Список каналов для отправки
   */
  async fetchShoutbox(to) {
    try {
      let response = await fetch(
        'http://igdc.ru/infusions/shoutbox_panel/shoutbox.php',
      );
      const responseJson = await response.json();

      for (let msg of responseJson['messages']) {
        const exists = await db.get('chat', msg['id']);

        if (!exists) {
          await db.store('chat', {
            id: msg['id'],
          });

          const chatMessage =
            '#миничат' +
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
    } catch (e) {
      console.error(e);
    }
  }

  /**
   * Получаем и отпарвляем новости
   *
   * @param {Array<String>} to Список каналов для отправки
   */
  async fetchNews(to) {
    try {
      const allNews = await news.getNews();

      for (let newsItem of allNews) {
        const exists = await db.get('news', newsItem['id']);

        if (!exists) {
          await db.store('news', { id: newsItem['id'] });

          const channelMessage =
            '#новости\n' +
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
    } catch (e) {
      console.log(e);
    }
  }

  /**
   * Получаем и отпарвляем последнее сообщение форума
   *
   * @param {Array<String>} to Список каналов для отправки
   */
  async fetchForum(to) {
    try {
      const lastPost = await forum.getLastMessage();

      const existing = await db.get('forum', lastPost['id']);

      if (!existing) {
        db.store('forum', { id: lastPost['id'] });

        const chatMessage =
          '#форум\n' +
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
          if (lastPost.media.length == 0) {
            this.api.sendMessage(chan, chatMessage);
          } else {
            this.api.sendMediaGroup(chan, chatMessage, lastPost.media);
          }
        }
      }
    } catch (e) {
      console.error(e);
    }
  }

  constructor(token) {
    this.api = new TelegramAPI(token);
  }
};
