
export interface RssSource {
  name: string;
  url: string;
}

export interface RssArticle {
  title: string;
  pubDate: string;
  link: string;
  guid: string;
  author: string;
  thumbnail: string;
  description: string;
  content: string;
  enclosure: {
    link?: string;
    type?: string;
    length?: number;
  };
  categories: string[];
}

export interface RssFeed {
  status: string;
  feed: {
    url: string;
    title: string;
    link: string;
    author: string;
    description: string;
    image: string;
  };
  items: RssArticle[];
  message?: string;
}
