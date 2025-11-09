const express = require('express');
const request = require('supertest');
const newsRouter = require('../routes/news');
const { responseHandler } = require('../middleware/responseHandler');
const { setNews } = require('../services/newsCache');

function createTestApp() {
  const app = express();
  app.use(responseHandler);
  app.use('/api/news', newsRouter);
  return app;
}

describe('GET /api/news', () => {
  beforeAll(async () => {
    await setNews([
      {
        title: 'Test headline Palestine',
        link: 'https://example.com/palestine',
        pubDate: new Date().toISOString(),
        source: 'Test Feed',
        description: 'Sample description'
      }
    ]);
  });

  it('returns latest news items', async () => {
    const app = createTestApp();
    const response = await request(app).get('/api/news');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data.items)).toBe(true);
    expect(response.body.data.items.length).toBeGreaterThan(0);
    expect(response.body.data.items[0]).toHaveProperty('title');
    expect(response.body.data.items[0]).toHaveProperty('link');
  });
});

