/**
 * Analytics Utilities for Forex Trading Research Lab
 * Calculate metrics, analyze patterns, and generate insights from trade data
 */

import { Prisma } from '@prisma/client';

/**
 * Calculate metrics for a specific strategy
 */
export function calculateMetricsByStrategy(trades: any[]) {
  if (!trades.length) {
    return {
      totalTrades: 0,
      closedTrades: 0,
      wins: 0,
      losses: 0,
      breakeven: 0,
      winRate: 0,
      totalRR: 0,
      avgWin: 0,
      avgLoss: 0,
      expectancy: 0,
      profitFactor: 0,
    };
  }

  const closed = trades.filter((t) => t.status === 'closed');
  const wins = closed.filter((t) => t.outcome === 'WIN');
  const losses = closed.filter((t) => t.outcome === 'LOSS');
  const breakeven = closed.filter((t) => t.outcome === 'BREAKEVEN');

  const totalRR = trades.reduce((sum, t) => sum + (t.riskRewardRatio || 0), 0);
  const totalWinRR = wins.reduce((sum, t) => sum + (t.riskRewardRatio || 0), 0);
  const totalLossAmount = Math.abs(losses.reduce((sum, t) => sum + (t.profitLoss || 0), 0));

  const winRate = closed.length > 0 ? (wins.length / closed.length) * 100 : 0;
  const avgWin = wins.length > 0 ? totalWinRR / wins.length : 0;
  const avgLoss = losses.length > 0 ? (totalLossAmount / losses.length) * -1 : 0;
  const profitFactor = Math.abs(avgLoss) > 0 ? avgWin / Math.abs(avgLoss) : 0;

  const expectancy =
    wins.length > 0 && losses.length > 0
      ? (wins.length * avgWin - losses.length * Math.abs(avgLoss)) / (wins.length + losses.length)
      : 0;

  return {
    totalTrades: trades.length,
    closedTrades: closed.length,
    wins: wins.length,
    losses: losses.length,
    breakeven: breakeven.length,
    winRate: parseFloat(winRate.toFixed(2)),
    totalRR: parseFloat(totalRR.toFixed(2)),
    avgWin: parseFloat(avgWin.toFixed(2)),
    avgLoss: parseFloat(avgLoss.toFixed(2)),
    expectancy: parseFloat(expectancy.toFixed(2)),
    profitFactor: parseFloat(profitFactor.toFixed(2)),
  };
}

/**
 * Calculate rule violation impact on profitability
 */
export function calculateRuleViolationImpact(
  trades: any[],
  tradeRuleCompliance: any[]
) {
  let hypotheticalPL = 0;
  let actualPL = 0;
  const ruleViolationCounts: Record<string, number> = {};
  const ruleViolationPL: Record<string, number> = {};

  for (const trade of trades) {
    actualPL += trade.profitLoss || 0;

    const violations = tradeRuleCompliance.filter(
      (c) => c.trade_id === trade.id && !c.followed
    );

    if (violations.length === 0) {
      hypotheticalPL += trade.profitLoss || 0;
    }

    for (const violation of violations) {
      const ruleId = violation.rule_id;
      ruleViolationCounts[ruleId] = (ruleViolationCounts[ruleId] || 0) + 1;
      ruleViolationPL[ruleId] = (ruleViolationPL[ruleId] || 0) + (trade.profitLoss || 0);
    }
  }

  return {
    actualPL: parseFloat(actualPL.toFixed(2)),
    hypotheticalPL: parseFloat(hypotheticalPL.toFixed(2)),
    impactFromViolations: parseFloat((actualPL - hypotheticalPL).toFixed(2)),
    ruleViolationCounts,
    ruleViolationPL,
  };
}

/**
 * Group trades by time period
 */
export function groupTradesByPeriod(
  trades: any[],
  periodType: 'day' | 'week' | 'month' | 'quarter' | 'half' | 'year'
) {
  const groups: Record<string, any[]> = {};

  for (const trade of trades) {
    const date = new Date(trade.entryTime);
    let key: string;

    switch (periodType) {
      case 'day':
        key = date.toISOString().split('T')[0];
        break;
      case 'week':
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        key = weekStart.toISOString().split('T')[0];
        break;
      case 'month':
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        break;
      case 'quarter':
        const quarter = Math.ceil((date.getMonth() + 1) / 3);
        key = `${date.getFullYear()}-Q${quarter}`;
        break;
      case 'half':
        const half = date.getMonth() < 6 ? 'H1' : 'H2';
        key = `${date.getFullYear()}-${half}`;
        break;
      case 'year':
        key = String(date.getFullYear());
        break;
    }

    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(trade);
  }

  return groups;
}

/**
 * Calculate metrics for a period
 */
export function periodMetrics(trades: any[]) {
  const metrics = calculateMetricsByStrategy(trades);
  return {
    period: {
      startDate: trades.length > 0 ? trades[0].entryTime : null,
      endDate: trades.length > 0 ? trades[trades.length - 1].entryTime : null,
    },
    ...metrics,
  };
}

/**
 * Analyze timeframe sequence performance
 */
export function timeframeSequenceAnalysis(
  trades: any[],
  timeframeCompliance: any[]
) {
  const sequences: Record<string, any[]> = {};

  for (const trade of trades) {
    const compliance = timeframeCompliance.filter((c) => c.trade_id === trade.id);
    const sequence = compliance.map((c) => c.role_type).join('→') || 'unknown';

    if (!sequences[sequence]) {
      sequences[sequence] = [];
    }
    sequences[sequence].push(trade);
  }

  const analysis: Record<string, any> = {};
  for (const [sequence, sequenceTrades] of Object.entries(sequences)) {
    analysis[sequence] = calculateMetricsByStrategy(sequenceTrades);
  }

  return analysis;
}

/**
 * Generate rule-based summary insights
 */
export function generateRuleBasedSummary(
  metrics: any,
  strategies: any[],
  tradeData: any
) {
  const insights = [];

  // Win rate analysis
  if (metrics.winRate > 60) {
    insights.push(
      `Excellent win rate of ${metrics.winRate}% — focus on consistency and maintaining edge.`
    );
  } else if (metrics.winRate < 30) {
    insights.push(
      `Win rate is ${metrics.winRate}% — review entry logic and rule adherence.`
    );
  }

  // Expectancy analysis
  if (metrics.expectancy > 1.0) {
    insights.push(
      `Positive expectancy of ${metrics.expectancy}R per trade — the strategy is profitable.`
    );
  } else if (metrics.expectancy < 0) {
    insights.push(
      `Negative expectancy of ${metrics.expectancy}R — strategy needs refinement.`
    );
  }

  // Rule adherence
  if (tradeData.ruleViolationImpact) {
    const impact = tradeData.ruleViolationImpact.impactFromViolations;
    if (impact < 0) {
      insights.push(
        `Rule violations cost you ${Math.abs(impact).toFixed(2)}R — stricter discipline needed.`
      );
    }
  }

  return {
    narrative: insights.join(' '),
    feedback: {
      stop: [],
      continue: [],
      experiment: [],
    },
  };
}
