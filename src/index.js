const Bot = require('./bot');

/** Канал для отправки всех обновлений */
const channel = process.env['CHANNEL'] || '@igdc_updates';

/** Чат, куда не следует спамить всем подряд, одних новостей будет достаточно */
const chat = process.env['CHAT'] || '@igdc_chat';

async function delay() {
  return new Promise(resolve => {
    setTimeout(resolve, 60000);
  });
}

async function main() {
  if (!process.env['TELEGRAM_TOKEN']) {
    console.error('TELEGRAM_TOKEN is required');
    return;
  }

  const bot = new Bot(process.env['TELEGRAM_TOKEN']);

  while (true) {
    try {
      await bot.fetchShoutbox([channel]);
      await bot.fetchForum([channel]);
      await bot.fetchNews([channel, chat]);
      console.log(new Date(), ' Update: OK');
    } catch (err) {
      console.error(new Date(), err);
    }
  }
}

main();
