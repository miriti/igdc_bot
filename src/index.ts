import 'dotenv/config';
import Bot from './bot.js';
import forum from './forum.js';

/** Канал для отправки всех обновлений */
const channel = process.env['CHANNEL'] || '@igdc_updates';

/** Чат, куда не следует спамить всем подряд, одних новостей будет достаточно */
const chat = process.env['CHAT'] || '@igdc_chat';

/**
 * @param ms Сколько ждать в миллисекундах
 * @returns
 */
async function delay(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function main() {
  if (!process.env['TELEGRAM_TOKEN']) {
    console.error('TELEGRAM_TOKEN is required');
    return;
  }

  const bot = new Bot(process.env['TELEGRAM_TOKEN']);

  const ONE_HOUR = 3_600_000;

  let delayTime = ONE_HOUR;

  while (true) {
    try {
      console.log("%s: It's time to check for updates!", new Date());

      const totalNew =
        (await bot.fetchShoutbox([channel])) +
        (await bot.fetchForum([channel])) +
        (await bot.fetchNews([channel, chat]));

      if (totalNew > 0) {
        delayTime = 60_000; // 1 минута
      } else {
        delayTime = Math.min(delayTime * 2, ONE_HOUR);
      }

      console.log(
        '%s: Updated. Total updates: %s, next check in %smin',
        new Date(),
        totalNew,
        Math.round(delayTime / 60_000),
      );
    } catch (err) {
      console.error(new Date(), err);
    }

    await delay(delayTime);
  }
}

main();
