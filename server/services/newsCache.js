const path = require('path');
const fs = require('fs-extra');

const CACHE_PATH = path.join(__dirname, '..', 'data', 'news_cache.json');

let cache = {
  items: [],
  lastUpdated: null
};

async function initializeNewsCache() {
  try {
    if (await fs.pathExists(CACHE_PATH)) {
      const raw = await fs.readFile(CACHE_PATH, 'utf8');
      if (raw) {
        const stored = JSON.parse(raw);
        if (Array.isArray(stored.items) && stored.lastUpdated) {
          cache = {
            items: stored.items,
            lastUpdated: stored.lastUpdated
          };
        }
      }
    }
  } catch (error) {
    console.warn('[news-cache] Failed to load cache:', error.message);
  }

  return cache;
}

function getNews() {
  return cache.items.slice();
}

function getLastUpdated() {
  return cache.lastUpdated;
}

async function persistCache() {
  try {
    await fs.ensureDir(path.dirname(CACHE_PATH));
    await fs.writeFile(CACHE_PATH, JSON.stringify(cache, null, 2), 'utf8');
  } catch (error) {
    console.warn('[news-cache] Failed to persist cache:', error.message);
  }
}

async function setNews(items) {
  cache = {
    items: Array.isArray(items) ? items.slice(0, items.length) : [],
    lastUpdated: new Date().toISOString()
  };

  await persistCache();
  return cache;
}

module.exports = {
  initializeNewsCache,
  getNews,
  setNews,
  getLastUpdated,
  CACHE_PATH
};

