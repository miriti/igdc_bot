const Parser = require('rss-parser');
const fetch = require('node-fetch');
const cheerio = require('cheerio');
const striptags = require('striptags');

class News {
  async getNews() {
    // TODO: Используем костыль, пока говнюк не починил RSS :(
    return this._getNews_crutch();

    let feed = await this.parser.parseURL('http://igdc.ru/rss.php');
    return feed.items;
  }

  async _getNews_crutch() {
    const html = await fetch('http://igdc.ru/').then(r => r.text());
    let $ = cheerio.load(html);

    const result = [];

    $('.table-border').each((i, el) => {
      // Пропускаем первый т.к. это "Привет"
      if (i > 0) {
        // Парсим ID
        const id = parseInt(
          $(el)
            .find('td.capmain a')
            .first()
            .attr('name')
            .replace('news_', ''),
        );

        // Парсим автора
        const author = $(el)
          .find('.capmain_right a')
          .text();

        // Парсим заголовок
        const title = $(el)
          .find('td.capmain')
          .text();

        // Первая ссылка в теле это картинка. Убираем ее
        $(el)
          .find('.main-body')
          .find('a')
          .first()
          .remove();

        // Меняем относительные ссылки на абсолютные
        $(el)
          .find('.main-body')
          .find('a')
          .each((i, a) => {
            let href = $(a).attr('href');

            if (href && href.indexOf('http://igdc.ru') == -1) {
              $(a).attr('href', 'http://igdc.ru' + href);
            }
          });

        // Парсим html, который пойдет в текст сообщения
        const html = striptags(
          $(el)
            .find('.main-body')
            .html(),
          ['b', 'i', 'a'],
        ).trim();

        result.push({
          id,
          title,
          author,
          html,
        });
      }
    });

    return result;
  }

  constructor() {
    this.parser = new Parser();
  }
}

module.exports = new News();
