const request = require('request-promise-native');
const unescape = require('unescape');
const sleep = require('sleep-promise');

const api = require('./api');
const db = require('./db');
const forum = require('./forum');

const channel = process.env['CHANNEL'] || '@igdc_chat';

async function main() {
  let me = await api.getMe();
  console.log(me);

  while (true) {
    let response = await request({
      url: 'http://igdc.ru/infusions/shoutbox_panel/shoutbox.php',
      json: true,
    });

    for (let message of response['messages']) {
      message['text'] = unescape(message['text']);
      message['user']['name'] = unescape(message['user']['name']);

      let db_message = await db.getMessage(message['id']);

      if (!db_message) {
        await db.storeMessage(
          message['id'],
          message['text'],
          message['user']['id'],
          message['user']['name'],
        );

        console.log(
          '%s %d %s: %s',
          new Date(),
          message['id'],
          message['user']['name'],
          message['text'],
        );

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

    let latestMessage = await forum.getLastMessage();
    if (!await db.getForumPost(latestMessage['id'])) {
      db.storeForumPost(latestMessage);
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

    await sleep(60000);
  }
}

main();
