const axios = require('axios');
const cheerio = require('cheerio');
const striptags = require('striptags');

class Forum {
  async getLastMessage() {
    let $;

    try {
      const html = (await axios('http://igdc.ru/')).data;

      $ = cheerio.load(html);
    } catch (err) {
      console.error(err);
      return null;
    }

    let lastPostEl = $('.side-body a.sidePost');

    let url = lastPostEl.attr('href');

    let postHash = url.slice(url.indexOf('#'));

    try {
      $ = cheerio.load(await axios('http://igdc.ru/' + url));
    } catch (err) {
      console.error(err.message);
      return null;
    }

    let thread = $('.capmain').html();

    let username = $('a[href="' + postHash + '"]')
      .parent()
      .parent()
      .parent()
      .prev()
      .find('a.header')
      .html();

    let postTD = $('a[href="' + postHash + '"]')
      .parent()
      .parent()
      .parent()
      .next()
      .find('td');

    const media = [];

    let gallery = $(postTD).find('.igdc_gallery');

    if (gallery.length != 0) {
      $(gallery)
        .find('a')
        .each((i, el) => {
          const rel = $(el).attr('href').replace('..', 'http://igdc.ru');
          media.push(rel);
        });

      gallery.remove();
    }

    $(postTD)
      .find('img')
      .each((i, el) => {
        media.push($(el).attr('src'));
      });

    let html = striptags(postTD.html(), ['b', 'i', 'a', 'pre']);

    return {
      id: Number(postHash.replace(/\D/g, '')),
      url: 'http://igdc.ru/' + url,
      thread,
      username,
      html,
      media,
    };
  }
}

module.exports = new Forum();
