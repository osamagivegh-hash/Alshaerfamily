# Palestine News Ticker

This document explains how the automated Palestine news ticker works and how to maintain it.

## Overview

The ticker fetches the latest Palestine–related headlines from multiple RSS feeds, filters them by Arabic/English keywords, deduplicates the stories, and exposes them through a cached Express endpoint. The React frontend consumes the endpoint and renders a marquee-style strip at the top of the site that refreshes every five minutes.

## Backend Flow

1. **Feeds & Keywords** — defined in `server/config/newsFeeds.js`. Optional overrides can be placed in `server/data/news_settings.json`.
2. **Fetcher** — `server/utils/newsFetcher.js` pulls all feeds with `rss-parser`, filters by the keywords, sorts, and dedupes the items.
3. **Cache** — `server/services/newsCache.js` keeps the latest items in memory and persists them to `server/data/news_cache.json` for warm starts.
4. **Cron Job** — `server/jobs/newsJob.js` refreshes the cache on boot and then every two minutes (configurable).
5. **API Endpoint** — `GET /api/news` returns the cached list (default 30 items, up to 100).

If a feed fails, the job logs the error and continues. The last successful cache is always returned.

### Changing Feeds or Keywords

- Edit `server/config/newsFeeds.js` to change defaults.
- Or create `server/data/news_settings.json` with:

  ```json
  {
    "feeds": ["https://example.com/rss"],
    "keywords": ["فلسطين", "Gaza"],
    "fetchCron": "*/5 * * * *",
    "maxItems": 75
  }
  ```

  Restart the backend to apply overrides.

### Cron Frequency

- Default pattern `*/2 * * * *` (every 2 minutes).
- Override via `NEWS_FETCH_CRON` env variable or `news_settings.json`.

### Cache Location

- Cached news stored in `server/data/news_cache.json`.
- Safe to delete; the cron job will repopulate on the next run.

## Frontend Integration

- `client/src/components/NewsTicker.jsx` fetches `/api/news?limit=50`, auto-refreshes, and renders the marquee with pause-on-hover.
- Styles in `client/src/components/NewsTicker.css`.
- The component is mounted inside the site header (`client/src/components/Header.jsx`).

### API Base URL

- Configure with `VITE_API_BASE_URL` in `.env` (defaults to `http://localhost:5000` in `env.example`).
- For production builds, set the deployed backend URL before running `npm run build`.

## Local Testing

```bash
# Backend
cd server
npm install
npm run dev   # or npm start

# Frontend
cd ../client
npm install
npm run dev
```

Visit `http://localhost:5173` (or the dev port) and ensure the ticker appears with live headlines. Hit `http://localhost:5000/api/news` to inspect the raw JSON.

## Deployment Notes

- Ensure the backend server can reach the configured RSS sources.
- Keep the cron frequency polite; avoid setting it below one minute to reduce load on upstream providers.
- If deploying to a stateless environment, make sure `server/data` is writable, or remove persistence if not needed.

## Extending Further

- Add Server-Sent Events for real-time updates via `/api/news/stream`.
- Implement a language detector to auto-switch ticker direction per item.
- Persist cache in Redis or another store if horizontal scaling is required.

