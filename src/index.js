const request = require('request-promise-native');
const unescape = require('unescape');
const sleep = require('sleep-promise');

const api = require('./api');
const db = require('./db');

async function main() {
  let me = await api.getMe();
  console.log(me);

  while (true) {
    console.log('%s %s', new Date(), 'Requesting new messages');

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
            '@igdc_chat',
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

    console.log('%s %s', new Date(), 'Waiting for 10 minutes');
    await sleep(600000);
  }
}

main();
