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
