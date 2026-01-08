import { test, expect } from '@playwright/test';
import { calculateMetricsByStrategy, groupTradesByPeriod, timeframeSequenceAnalysis } from '@/lib/analytics';

test.describe('Analytics Utilities', () => {
  const mockTrades = [
    {
      id: '1',
      entryPrice: 100,
      exitPrice: 110,
      entryTime: new Date('2024-01-01'),
      exitTime: new Date('2024-01-02'),
      direction: 'LONG',
      pair: 'EUR/USD',
      volume: 1,
      userId: 'test-user',
      riskRewardRatio: 2,
      status: 'closed',
      outcome: 'WIN',
    },
    {
      id: '2',
      entryPrice: 100,
      exitPrice: 95,
      entryTime: new Date('2024-01-03'),
      exitTime: new Date('2024-01-04'),
      direction: 'LONG',
      pair: 'EUR/USD',
      volume: 1,
      userId: 'test-user',
      riskRewardRatio: -1,
      status: 'closed',
      outcome: 'LOSS',
    },
  ];

  test('calculateMetricsByStrategy calculates correct win rate', () => {
    const metrics = calculateMetricsByStrategy(mockTrades as any);
    expect(metrics.winRate).toBe(50);
  });

  test('groupTradesByPeriod groups trades correctly by month', () => {
    const grouped = groupTradesByPeriod(mockTrades as any, 'month');
    expect(Object.keys(grouped).length).toBeGreaterThan(0);
  });
});
