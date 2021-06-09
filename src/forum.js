const fetch = require('node-fetch');
const cheerio = require('cheerio');
const striptags = require('striptags');

class Forum {
  async getLastMessage() {
    let $;

    try {
      const response = await fetch('http://igdc.ru/');
      const html = await response.text();

      $ = cheerio.load(html);
    } catch (err) {
      console.error(err);
      return null;
    }

    let lastPostEl = $('.side-body a.sidePost');

    let url = lastPostEl.attr('href');

    let postHash = url.slice(url.indexOf('#'));

    try {
      $ = cheerio.load(
        await fetch('http://igdc.ru/' + url).then(r => r.text()),
        {
          decodeEntities: false,
        },
      );
    } catch (err) {
      console.error(err);
      process.exit();
    }

    let threadName = $('.capmain').html();

    let userName = $('a[href="' + postHash + '"]')
      .parent()
      .parent()
      .parent()
      .prev()
      .find('a.header')
      .html();

    let postHtml = striptags(
      $('a[href="' + postHash + '"]')
        .parent()
        .parent()
        .parent()
        .next()
        .find('td')
        .html(),
      ['b', 'i', 'a'],
    );

    return {
      id: Number(postHash.replace(/\D/g, '')),
      url: 'http://igdc.ru/' + url,
      thread: threadName,
      username: userName,
      html: postHtml,
    };
  }
}

module.exports = new Forum();
