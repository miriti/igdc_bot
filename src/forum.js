const request = require('request-promise-native');
const cheerio = require('cheerio');
const striptags = require('striptags');

class Forum {
  async getLastMessage() {
    let $;

    try {
      $ = cheerio.load(await request('http://igdc.ru/'));
    } catch (err) {
      console.error(err);
      process.exit();
    }

    let url = $('.side-body a.sidePost').attr('href');

    let postHash = url.slice(url.indexOf('#'));

    try {
      $ = cheerio.load(await request('http://igdc.ru/' + url), {
        decodeEntities: false,
      });
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
