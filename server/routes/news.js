const express = require('express');
const { getNews, getLastUpdated } = require('../services/newsCache');

const router = express.Router();

router.get('/', (req, res) => {
  const { q, limit } = req.query;
  const query = typeof q === 'string' ? q.trim() : '';
  const requestedLimit = Math.min(Math.max(parseInt(limit, 10) || 30, 1), 100);

  const cachedItems = getNews();

  const filteredItems = query
    ? cachedItems.filter(item => {
        const haystack = `${item.title} ${item.source || ''}`.toLowerCase();
        return haystack.includes(query.toLowerCase());
      })
    : cachedItems;

  const slicedItems = filteredItems.slice(0, requestedLimit);

  return res.success(200, 'Latest Palestine headlines', {
    items: slicedItems,
    lastUpdated: getLastUpdated()
  });
});

module.exports = router;

