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

    const lastPostEl = $('.side-body a.sidePost');

    const url = lastPostEl.attr('href');

    const postHash = url.slice(url.indexOf('#'));

    try {
      $ = cheerio.load((await axios('http://igdc.ru/' + url)).data);
    } catch (err) {
      console.error(err.message);
      return null;
    }

    const thread = $('.capmain').html();

    const username = $('a[href="' + postHash + '"]')
      .parent()
      .parent()
      .parent()
      .prev()
      .find('a.header')
      .html();

    const postTD = $('a[href="' + postHash + '"]')
      .parent()
      .parent()
      .parent()
      .next()
      .find('td');

    const media = [];

    const gallery = $(postTD).find('.igdc_gallery');

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

    const html = striptags(postTD.html(), ['b', 'i', 'a', 'pre']);

    const postData = {
      id: Number(postHash.replace(/\D/g, '')),
      url: 'http://igdc.ru/' + url,
      thread,
      username,
      html,
      media,
    };

    return postData;
  }
}

module.exports = new Forum();
