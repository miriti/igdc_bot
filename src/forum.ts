import axios from 'axios';
import { CheerioAPI, load } from 'cheerio';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat.js';
import localizedFormat from 'dayjs/plugin/localizedFormat.js';
import localeRU from 'dayjs/locale/ru.js';
import striptags from 'striptags';

dayjs.extend(customParseFormat);
dayjs.extend(localizedFormat);
dayjs.locale(localeRU);

interface IForumPost {
  id: number;
  date: Date;
  url: string;
  thread: string;
  username: string;
  html: string;
  media: string[];
}

class Forum {
  private async getPosts(
    url: string,
    numPrevPages: number,
  ): Promise<IForumPost[]> {
    console.log('Parse posts from %s [%s]', url, numPrevPages);
    let result: IForumPost[] = [];

    const $ = load((await axios.get(url)).data);

    const thread = $('td.capmain').text();

    const postTrs = $('tr[style="height: 125"]');

    for (const tr of postTrs) {
      const $post = load($(tr).html());

      const iframes = $post('iframe');

      for (const iframe of iframes) {
        const ytUrl = $post(iframe).attr('src');
        $post(iframe).replaceWith('<a href="https:' + ytUrl + '">YouTube</a>');
      }
      const media: string[] = [];

      const gallery = $post('.igdc_gallery');

      if (gallery.length != 0) {
        $post(gallery)
          .find('a')
          .each((i, el) => {
            const rel = $(el).attr('href').replace('..', 'http://igdc.ru');
            media.push(rel);
          });
      }

      $post('.igdc_gallery').remove();

      $post('img').each((i, el) => {
        media.push($(el).attr('src'));
      });

      const postableHtml = striptags($post.html(), [
        'b',
        'i',
        'a',
        'pre',
      ]).trim();

      const postInfo = $(tr).prev().prev();

      const postName = $(postInfo).find('a[name]');
      const id = parseInt($(postName).attr('name').slice(1));
      const author = $(postInfo).find('a[class="header"]').text();

      const postDate = dayjs(
        $(tr).prev().text().trim().split(' ').slice(1, 3).join(' '),
        'DD.MM.YYYY H:mm',
      ).toDate();

      result.push({
        id,
        date: postDate,
        html: postableHtml,
        media: media.filter((val, idx, arr) => arr.indexOf(val) === idx),
        username: author,
        thread,
        url: `${url}#p${id}`,
      });
    }

    if (numPrevPages > 0) {
      const smallSpans = $('span.small');
      let currentPage: number;
      for (const span of smallSpans) {
        const text = $(span).text();

        const matches = text.match(/Страница ([0-9]+) из ([0-9]+)/i);

        if (matches != null) {
          currentPage = parseInt(matches[1]);
          break;
        }
      }

      if (currentPage > 1) {
        const parsedUrl = new URL(url);
        parsedUrl.searchParams.delete('last');
        parsedUrl.searchParams.delete('rowstart');
        parsedUrl.searchParams.append('rowstart', `${(currentPage - 2) * 20}`);

        const prevResult = await this.getPosts(
          parsedUrl.toString(),
          numPrevPages - 1,
        );

        result = prevResult.concat(result);
      }
    }

    return result;
  }

  async getNewMessages(): Promise<IForumPost[]> {
    let $: CheerioAPI;

    try {
      const html = (await axios('http://igdc.ru/')).data;

      $ = load(html);
    } catch (err) {
      console.error(err);
      return null;
    }

    const lastPostEl = $('.side-body a.sidePost');

    const postPath = lastPostEl.attr('href');

    return await this.getPosts(`http://igdc.ru/${postPath.split('#')[0]}`, 1);
  }
}

const forum = new Forum();

export default forum;
