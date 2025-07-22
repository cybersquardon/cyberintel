import type { RssFeed, RssArticle } from '../types';

const CORS_PROXY = 'https://api.allorigins.win/raw?url=';
const ARTICLE_COUNT = 15;

/**
 * A robust method to get the text content of a namespaced or non-namespaced tag.
 * It finds a direct child element by its local tag name, ignoring prefixes.
 * @param parent The parent element to search within.
 * @param tagName The local name of the tag (e.g., 'title').
 * @returns The text content or an empty string.
 */
const getChildElementText = (parent: Element, tagName: string): string => {
    const lowerTagName = tagName.toLowerCase();
    const el = Array.from(parent.children).find(c => c.tagName.toLowerCase().endsWith(lowerTagName));
    return el?.textContent?.trim() || '';
};

/**
 * Parses a single item (from RSS <item> or Atom <entry>) into a standardized RssArticle object.
 * @param item The DOM element for the item/entry.
 * @param index The index of the item for fallback GUID creation.
 * @param feedUrl The original feed URL for fallback GUID creation.
 * @returns A normalized RssArticle object.
 */
const parseItem = (item: Element, index: number, feedUrl: string): RssArticle => {
    // This logic handles both RSS <item> and Atom <entry> structures.
    const title = getChildElementText(item, 'title');
    const pubDate = getChildElementText(item, 'pubDate') || getChildElementText(item, 'published') || getChildElementText(item, 'updated');

    // Atom links are complex (<link href="..."/>), RSS links are simple (<link>...</link>)
    let link = getChildElementText(item, 'link');
    if (!link) { 
        const linkTag = Array.from(item.children).find(c => c.tagName.toLowerCase().endsWith('link'));
        link = linkTag?.getAttribute('href') || '';
    }

    const guid = getChildElementText(item, 'guid') || getChildElementText(item, 'id') || link || `${feedUrl}#${index}`;

    // Content can be in multiple places, we search in order of preference.
    const content = getChildElementText(item, 'content:encoded') || getChildElementText(item, 'content') || getChildElementText(item, 'description') || getChildElementText(item, 'summary') || '';
    const description = getChildElementText(item, 'description') || getChildElementText(item, 'summary') || content.replace(/<[^>]*>?/gm, '').substring(0, 250);

    // Author can be nested in Atom (author > name)
    let author = getChildElementText(item, 'dc:creator') || getChildElementText(item, 'author');
    if (!author) {
        const authorTag = Array.from(item.children).find(c => c.tagName.toLowerCase().endsWith('author'));
        if (authorTag) {
            author = getChildElementText(authorTag, 'name');
        }
    }
    
    const mediaThumbnail = Array.from(item.children).find(c => c.tagName.toLowerCase().endsWith('media:thumbnail'));
    const enclosure = Array.from(item.children).find(c => c.tagName.toLowerCase().endsWith('enclosure'));
    const thumbnail = mediaThumbnail?.getAttribute('url') || enclosure?.getAttribute('url') || '';

    return {
        title,
        pubDate,
        link,
        guid,
        author,
        thumbnail,
        description,
        content,
        enclosure: {
            link: enclosure?.getAttribute('url') || undefined,
            type: enclosure?.getAttribute('type') || undefined,
            length: Number(enclosure?.getAttribute('length')) || undefined,
        },
        categories: Array.from(item.children)
            .filter(c => c.tagName.toLowerCase().endsWith('category'))
            .map(cat => cat.textContent?.trim() || cat.getAttribute('term') || '')
            .filter(Boolean),
    };
};

export const fetchFeed = async (rssUrl: string): Promise<RssFeed> => {
  const encodedUrl = encodeURIComponent(rssUrl);
  const apiUrl = `${CORS_PROXY}${encodedUrl}`;

  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
        throw new Error(`Failed to fetch feed via proxy. Status: ${response.status} ${response.statusText}`);
    }
    const xmlString = await response.text();
    
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlString, 'application/xml');
    
    const parseError = doc.querySelector('parsererror');
    if (parseError) {
      console.error(`XML Parse Error for ${rssUrl}:`, parseError.textContent);
      throw new Error(`Failed to parse XML. The feed might be invalid or the content is not XML.`);
    }

    const feedRoot = doc.querySelector('channel') || doc.querySelector('feed');

    if (!feedRoot) {
        throw new Error('Invalid feed format: Could not find <channel> or <feed> element.');
    }
    
    const itemNodes = feedRoot.querySelectorAll('item, entry');

    const items = Array.from(itemNodes)
      .map((item, index) => parseItem(item, index, rssUrl))
      .slice(0, ARTICLE_COUNT);

    const feedInfo = {
        title: getChildElementText(feedRoot, 'title'),
        link: getChildElementText(feedRoot, 'link'),
        description: getChildElementText(feedRoot, 'description') || getChildElementText(feedRoot, 'subtitle'),
        url: rssUrl,
        author: '', // Feed-level author is less important than item-level
        image: getChildElementText(feedRoot.querySelector('image') || feedRoot, 'url') || getChildElementText(feedRoot, 'icon') || getChildElementText(feedRoot, 'logo') || ''
    };

    return {
        status: 'ok',
        feed: feedInfo,
        items: items,
    };

  } catch (error) {
    console.error(`Error processing feed for ${rssUrl}:`, error);
    if (error instanceof Error) {
        throw error;
    }
    throw new Error(`An unknown error occurred while processing ${rssUrl}.`);
  }
};