import axios from 'axios';

/**
 * Telegram API
 */
export default class TelegramAPI {
  private token: string;

  /**
   * Send message
   */
  async sendMessage(to, message) {
    return this.request('post', 'sendMessage', {
      chat_id: to,
      text: message,
      parse_mode: 'HTML',
    });
  }

  /**
   * @param {Array<Object>} media
   */
  async sendMediaGroup(to: string, message: string, media: string[]) {
    return this.request('post', 'sendMediaGroup', {
      chat_id: to,
      media: media.map((url, index) => {
        const obj = {
          type: 'photo',
          media: url,
          parse_mode: 'HTML',
        };

        if (index == 0) {
          obj['caption'] = message;
        }

        return obj;
      }),
    });
  }

  /**
   * Generic request
   */
  async request(http_method: 'post' | 'get', method: string, data: any) {
    const url = `https://api.telegram.org/bot${this.token}/${method}`;
    const body = data ? JSON.stringify(data) : null;

    return await axios(url, {
      method: http_method,
      data: body,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  /**
   * Constructor
   */
  constructor(token: string) {
    this.token = token;
  }
}
