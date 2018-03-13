const request = require('request-promise-native');
const sleep = require('sleep-promise');
const unescape = require('unescape');
const striptags = require('striptags');

const api = require('./api');
const db = require('./db');
const forum = require('./forum');
const news = require('./news');

const channel = process.env['CHANNEL'] || '@igdc_updates';
const chat = process.env['CHAT'] || '@igdc_chat';

async function main() {
  let me = await api.getMe();
  console.log(me);

  while (true) {
    try {
      let response = await request({
        url: 'http://igdc.ru/infusions/shoutbox_panel/shoutbox.php',
        json: true,
      });

      for (let message of response['messages']) {
        message['text'] = unescape(message['text']);
        message['user']['name'] = unescape(message['user']['name']);

        let db_message = await db.get('messages', message['id']);

        if (!db_message) {
          await db.store('messages', {
            id: message['id'],
            text: message['text'],
            user_id: message['user']['id'],
            user_name: message['user']['name'],
          });

          try {
            await api.sendMessage(
              channel,
              '<a href="http://igdc.ru/infusions/shoutbox_panel/shoutbox_archive.php">Мини-чат</a>' +
                '\n' +
                '<b>' +
                message['user']['name'].trim() +
                '</b>: ' +
                message['text'],
            );
          } catch (err) {
            console.error(err);
          }
        }
      }
    } catch (err) {
      console.error(err);
    }

    try {
      let latestMessage = await forum.getLastMessage();
      if (!await db.get('forum_posts', latestMessage['id'])) {
        db.store('forum_posts', latestMessage);
        await api.sendMessage(
          channel,
          '<a href="' +
            latestMessage['url'] +
            '">' +
            latestMessage['thread'] +
            '</a>\n<b>' +
            latestMessage['username'] +
            '</b>\n' +
            latestMessage['html'],
        );
      }
    } catch (err) {
      console.error(err);
    }

    try {
      let latestNews = await news.getNews();
      for (let newsItem of latestNews) {
        if (!await db.get('news', newsItem['pubDate'])) {
          let postHtml = striptags(newsItem['content'], ['a', 'b', 'i']);
          await db.store('news', {
            id: newsItem['pubDate'],
            title: newsItem['title'],
            author: newsItem['author'],
            html: postHtml,
          });

          await api.sendMessage(
            chat,
            '<b>' +
              newsItem['title'] +
              '</b>\n' +
              postHtml +
              '\n\n<i>' +
              newsItem['author'] +
              '</i>',
          );

          await api.sendMessage(
            channel,
            '<b>' +
              newsItem['title'] +
              '</b>\n' +
              postHtml +
              '\n\n<i>' +
              newsItem['author'] +
              '</i>',
          );
        }
      }
    } catch (err) {
      console.error(err);
    }

    await sleep(60000);
  }
}

main();
