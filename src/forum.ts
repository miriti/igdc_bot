import axios from 'axios';
import { CheerioAPI, load } from 'cheerio';
import striptags from 'striptags';

class Forum {
  async getLastMessage() {
    let $: CheerioAPI;

    try {
      const html = (await axios('http://igdc.ru/')).data;

      $ = load(html);
    } catch (err) {
      console.error(err);
      return null;
    }

    const lastPostEl = $('.side-body a.sidePost');

    const url = lastPostEl.attr('href');

    const postHash = url.slice(url.indexOf('#'));

    try {
      $ = load((await axios('http://igdc.ru/' + url)).data);
    } catch (err) {
      console.error(err.message);
      return null;
    }

    const thread: string = $('.capmain').html();

    const username: string = $('a[href="' + postHash + '"]')
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

    const media: string[] = [];

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

const forum = new Forum();

export default forum;
