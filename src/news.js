const Parser = require('rss-parser');

class News {
  async getNews() {
    let feed = await this.parser.parseURL('http://igdc.ru/rss.php');
    return feed.items;
  }

  constructor() {
    this.parser = new Parser();
  }
}

module.exports = new News();
