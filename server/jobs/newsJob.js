const cron = require('node-cron');
const { fetchLatestNews } = require('../utils/newsFetcher');
const { setNews, initializeNewsCache } = require('../services/newsCache');
const { FETCH_CRON } = require('../config/newsFeeds');

let scheduledTask = null;

async function runNewsSync() {
  try {
    console.info('[news-job] Fetching latest Palestine headlines...');
    const items = await fetchLatestNews();
    await setNews(items);
    console.info(`[news-job] Cache updated (${items.length} items).`);
  } catch (error) {
    console.error('[news-job] Failed to update news cache:', error.message);
  }
}

async function startNewsJob() {
  await initializeNewsCache();

  await runNewsSync();

  if (scheduledTask) {
    return scheduledTask;
  }

  scheduledTask = cron.schedule(FETCH_CRON, runNewsSync, {
    name: 'palestine-news-job',
    scheduled: true,
    timezone: 'Etc/UTC'
  });

  console.info(`[news-job] Scheduled with cron pattern "${FETCH_CRON}".`);

  return scheduledTask;
}

module.exports = {
  startNewsJob,
  runNewsSync
};

