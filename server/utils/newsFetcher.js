const Parser = require('rss-parser');
const { FEEDS, KEYWORDS, MAX_ITEMS } = require('../config/newsFeeds');

const parser = new Parser({
  timeout: 20000,
  headers: {
    'User-Agent': 'AlshaerFamilyNewsBot/1.0 (+https://alshaerfamily.onrender.com)'
  }
});

const keywordRegex = new RegExp(
  KEYWORDS
    .map(keyword => keyword.trim())
    .filter(Boolean)
    .map(keyword => keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .join('|'),
  'i'
);

function normalizeText(text = '') {
  return String(text || '').replace(/\s+/g, ' ').trim();
}

function buildItem(rawItem, source) {
  const title = normalizeText(rawItem.title);
  const link = rawItem.link || rawItem.guid || '';
  const pubDate = rawItem.isoDate || rawItem.pubDate || new Date().toISOString();

  return {
    title,
    link,
    pubDate,
    source,
    description: normalizeText(rawItem.contentSnippet || rawItem.content || ''),
    image: rawItem.enclosure?.url || null
  };
}

function filterByKeywords(item) {
  const haystack = `${item.title} ${item.description || ''}`.trim();
  return keywordRegex.test(haystack);
}

function dedupeItems(items) {
  const seen = new Set();

  return items.filter(item => {
    const key = item.link || `${item.title}-${item.pubDate}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

function sortByDateDesc(items) {
  return items.sort((a, b) => {
    const dateA = new Date(a.pubDate || 0).getTime();
    const dateB = new Date(b.pubDate || 0).getTime();
    return dateB - dateA;
  });
}

async function fetchFeed(url) {
  try {
    const feed = await parser.parseURL(url);
    const source = feed?.title || url;
    const items = Array.isArray(feed?.items) ? feed.items : [];
    return items.map(item => buildItem(item, source));
  } catch (error) {
    console.warn(`[news-fetcher] Failed to fetch feed ${url}:`, error.message);
    return [];
  }
}

async function fetchLatestNews() {
  const results = await Promise.all(FEEDS.map(feed => fetchFeed(feed)));
  const allItems = results.flat();

  const filtered = allItems.filter(filterByKeywords);
  const deduped = dedupeItems(filtered);
  const sorted = sortByDateDesc(deduped);

  return sorted.slice(0, MAX_ITEMS);
}

module.exports = {
  fetchLatestNews
};

