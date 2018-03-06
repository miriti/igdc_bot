const request = require('request-promise-native');
const cheerio = require('cheerio');

class Forum {
  async getLastMessage() {
    let $ = cheerio.load(await request('http://igdc.ru/'));
    let url = $('.side-body a.sidePost').attr('href');

    let postHash = url.slice(url.indexOf('#'));

    $ = cheerio.load(await request('http://igdc.ru/' + url), {
      decodeEntities: false,
    });

    let threadName = $('.capmain').html();

    let userName = $('a[href="' + postHash + '"]')
      .parent()
      .parent()
      .parent()
      .prev()
      .find('a.header')
      .html();

    let postHtml = $('a[href="' + postHash + '"]')
      .parent()
      .parent()
      .parent()
      .next()
      .find('td')
      .html();

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
