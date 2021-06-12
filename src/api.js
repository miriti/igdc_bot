const fetch = require('node-fetch');
/**
 * Telegram API
 */
module.exports = class TelegramAPI {
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
  async sendMediaGroup(to, message, media) {
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
  async request(http_method, method, data) {
    const url = `https://api.telegram.org/bot${this.token}/${method}`;
    const body = data ? JSON.stringify(data) : null;

    return fetch(url, {
      method: http_method,
      body,
      headers: { 'Content-Type': 'application/json' },
    }).then(r => r.json());
  }

  /**
   * Constructor
   */
  constructor(token) {
    this.token = token;
  }
};
