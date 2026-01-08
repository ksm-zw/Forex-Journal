import { test, expect } from '@playwright/test';

test.describe('E2E - Analytics', () => {
  const baseUrl = 'http://localhost:3000';
  const headers = { 'x-user-id': 'demo@forex-research.com' };

  test('Get analytics comparison', async ({ request }) => {
    const response = await request.get(`${baseUrl}/api/analytics/strategy-comparison`, { headers });
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
  });

  test('Get period analysis', async ({ request }) => {
    const response = await request.get(`${baseUrl}/api/analytics/period-analysis`, { headers });
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
  });

  test('Get rule violations', async ({ request }) => {
    const response = await request.get(`${baseUrl}/api/analytics/rule-violations`, { headers });
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
  });

  test('Get timeframe performance', async ({ request }) => {
    const response = await request.get(`${baseUrl}/api/analytics/timeframe-performance`, { headers });
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
  });
});

test.describe('E2E - Trade Management', () => {
  const baseUrl = 'http://localhost:3000';
  const headers = { 'x-user-id': 'demo@forex-research.com' };

  test('Get summaries', async ({ request }) => {
    const response = await request.get(`${baseUrl}/api/summaries`, { headers });
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
  });
});

