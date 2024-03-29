import axios from 'axios';
import dayjs from 'dayjs';
import TelegramAPI from './api.js';
import db from './db.js';
import forum from './forum.js';
import news from './news.js';

interface IChatMessage {
  id: number;
  time: string;
  ban_type: number;
  user: {
    id: number;
    name: string;
    avatar: string;
    rank: 0;
  };
  text: string;
}

function truncate(text: string, link: string, len: number) {
  if (text.length < len) return text;

  const linkCode = `... <a href="${link}">читать целиком</a>`;

  return text.substring(0, len - linkCode.length - 1) + linkCode;
}

export default class Bot {
  private api: TelegramAPI;

  /**
   * Получаем и отпарвляем сообщения из чата
   *
   * @param  to Список каналов для отправки
   */
  async fetchShoutbox(to: string[]) {
    let numNew = 0;
    try {
      const responseJson: { messages: IChatMessage[] } = (
        await axios('http://igdc.ru/infusions/shoutbox_panel/shoutbox.php')
      ).data;

      for (let msg of responseJson.messages.reverse()) {
        const exists = await db.get('chat', msg.id);
        if (!exists) {
          const chatMessage = `#миничат\n<b>${msg.user.name.trim()}</b>: ${
            msg.text
          }`;

          for (let chan of to) {
            console.log('Send a minichat message to %s', chan);
            await this.api.sendMessage(chan, chatMessage);
          }

          await db.store('chat', {
            id: msg.id,
          });
          numNew++;
        }
      }
    } catch (e) {
      console.error(e);
    }
    return numNew;
  }

  /**
   * Получаем и отпарвляем новости
   *
   * @param to Список каналов для отправки
   */
  async fetchNews(to: string[]) {
    let numNew = 0;
    try {
      const allNews = await news.getNews();

      for (let newsItem of allNews) {
        const exists = await db.get('news', newsItem['id']);

        if (!exists) {
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
            console.log('Send a news to %s', chan);
            await this.api.sendMessage(chan, channelMessage);
          }

          await db.store('news', { id: newsItem['id'] });
          numNew++;
        }
      }
    } catch (e) {
      console.error(e.message);
    }

    return numNew;
  }

  /**
   * Получаем и отпарвляем последнее сообщение форума
   *
   * @param to Список каналов для отправки
   *
   * @returns Количество новых сообщений на форуме
   */
  async fetchForum(to: string[]): Promise<number> {
    let numNew = 0;
    try {
      const posts = await forum.getNewMessages();

      for (const post of posts) {
        const existing = await db.get('forum', post['id']);

        if (!existing) {
          const chatMessage = `#форум\n<a href="${post['url']}">${
            post['thread']
          }</a>\n<b>${post['username']}</b>, <i>${dayjs(post.date).format(
            'LLLL',
          )} GMT</i>:\n\n${post['html']}`;

          for (let chan of to) {
            console.log('Send a forum message to %s', chan);
            if (post.media.length == 0) {
              await this.api.sendMessage(
                chan,
                truncate(chatMessage, post['url'], 4096),
              );
            } else {
              await this.api.sendMediaGroup(
                chan,
                truncate(chatMessage, post['url'], 1024),
                post.media,
              );
            }
          }
          db.store('forum', { id: post['id'] });
          numNew++;
        }
      }
    } catch (e) {
      console.error(e);
    }
    return numNew;
  }

  constructor(token) {
    this.api = new TelegramAPI(token);
  }
}
