
import type { RssSource } from './types';

export const ALL_SOURCES_OBJECT: RssSource = {
  name: 'All Sources',
  url: 'all-sources'
};

export const RSS_SOURCES: RssSource[] = [
  { name: 'The Hacker News', url: 'https://thehackernews.com/feeds/posts/default' },
  { name: 'BleepingComputer', url: 'https://www.bleepingcomputer.com/feed/' },
  { name: 'CISA News', url: 'https://www.cisa.gov/news.xml' },
  { name: 'CISA Blog', url: 'https://www.cisa.gov/cisa/blog.xml' },
  { name: 'CISA All Advisories', url: 'https://www.cisa.gov/cybersecurity-advisories/all.xml' },
  { name: 'CISA ICS Advisories', url: 'https://www.cisa.gov/cybersecurity-advisories/ics-advisories.xml' },
  { name: 'Dark Reading', url: 'https://www.darkreading.com/rss.xml' },
  { name: 'Help Net Security', url: 'https://www.helpnetsecurity.com/feed/' },
  { name: 'CSO Online', url: 'https://www.csoonline.com/feed/' },
  { name: 'Wired Security', url: 'https://www.wired.com/feed/category/security/latest/rss' },
  { name: 'Security Affairs', url: 'https://securityaffairs.co/feed' },
  { name: 'Graham Cluley', url: 'https://grahamcluley.com/feed/' },
  { name: 'Zero Day Initiative', url: 'https://www.zerodayinitiative.com/blog?format=rss' },
  { name: 'Krebs on Security', url: 'https://krebsonsecurity.com/feed/' },
  { name: 'The Record', url: 'https://therecord.media/feed/' },
  { name: 'GBHacker', url: 'https://gbhackers.com/feed/' },
  { name: 'Schneier on Security', url: 'https://www.schneier.com/feed/' },
  { name: 'Troy Hunt', url: 'https://www.troyhunt.com/feed/' },
  { name: 'Cybersecurity News', url: 'https://cybersecuritynews.com/feed/' },
  { name: 'Crowdstrike', url: 'https://www.crowdstrike.com/en-us/blog//feed' },
  { name: 'Palo Alto (Unit 42)', url: 'https://unit42.paloaltonetworks.com/feed/' },
  { name: 'Cisco Security', url: 'https://blogs.cisco.com/security/feed' },
];
