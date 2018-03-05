const request = require('request-promise-native');

/**
 * Telegram API
 */
class TelegramAPI {
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
   * Get Me
   */
  async getMe() {
    return this.request('get', 'getMe');
  }

  /**
   * Generic request
   */
  async request(http_method, method, data) {
    return request[http_method]({
      url: 'https://api.telegram.org/bot' + this.token + '/' + method,
      json: true,
      body: data,
    });
  }

  /**
   * Constructor
   */
  constructor() {
    this.token = process.env['TELEGRAM_TOKEN'];
  }
}

module.exports = new TelegramAPI();
