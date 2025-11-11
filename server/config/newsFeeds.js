const path = require('path');
const fs = require('fs-extra');

const DEFAULT_FEEDS = [
  'https://www.aljazeera.com/xml/rss/all.xml',
  'https://www.al-monitor.com/rss',
  'https://www.newarab.com/rss.xml',
  'https://www.skynewsarabia.com/rss/middle-east.xml',
  'https://feeds.bbci.co.uk/arabic/middleeast/rss.xml'
];

const DEFAULT_KEYWORDS = [
  'فلسطين',
  'غزة',
  'القدس',
  'الضفة',
  'الاحتلال',
  'قطاع غزة',
  'Palestine',
  'Gaza',
  'Jerusalem',
  'West Bank',
  'Occupation'
];

const DEFAULT_FETCH_CRON = '*/2 * * * *';
const DEFAULT_MAX_ITEMS = 50;

const SETTINGS_PATH = path.join(__dirname, '..', 'data', 'news_settings.json');

function loadOverrides() {
  try {
    if (fs.existsSync(SETTINGS_PATH)) {
      const raw = fs.readFileSync(SETTINGS_PATH, 'utf8');
      if (raw) {
        return JSON.parse(raw);
      }
    }
  } catch (error) {
    console.warn('[news-feeds] Failed to load overrides:', error.message);
  }

  return {};
}

const overrides = loadOverrides();

const FEEDS = Array.isArray(overrides.feeds) && overrides.feeds.length
  ? overrides.feeds
  : DEFAULT_FEEDS;

const KEYWORDS = Array.isArray(overrides.keywords) && overrides.keywords.length
  ? overrides.keywords
  : DEFAULT_KEYWORDS;

const FETCH_CRON = overrides.fetchCron || process.env.NEWS_FETCH_CRON || DEFAULT_FETCH_CRON;
const MAX_ITEMS = Number(overrides.maxItems || process.env.NEWS_MAX_ITEMS || DEFAULT_MAX_ITEMS) || DEFAULT_MAX_ITEMS;

module.exports = {
  FEEDS,
  KEYWORDS,
  FETCH_CRON,
  MAX_ITEMS,
  SETTINGS_PATH
};

