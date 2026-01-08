import { test, expect } from '@playwright/test';

test.describe('API Routes', () => {
  const baseUrl = 'http://localhost:3000';
  const headers = { 'x-user-id': 'demo@forex-research.com' };

  test('GET /api/strategies returns list of strategies', async ({ request }) => {
    const response = await request.get(`${baseUrl}/api/strategies`, { headers });
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(Array.isArray(data.strategies)).toBe(true);
  });

  test('GET /api/trades returns list of trades', async ({ request }) => {
    const response = await request.get(`${baseUrl}/api/trades`, { headers });
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(Array.isArray(data)).toBe(true);
  });

  test('GET /api/summaries returns list of summaries', async ({ request }) => {
    const response = await request.get(`${baseUrl}/api/summaries`, { headers });
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
  });

  test('Missing user returns error', async ({ request }) => {
    const response = await request.get(`${baseUrl}/api/strategies`, {
      headers: { 'x-user-id': 'nonexistent@test.com' },
    });
    expect(response.status()).toBeGreaterThanOrEqual(404);
  });
});
