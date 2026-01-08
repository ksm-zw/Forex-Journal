// AI Summary Integration - Optional OpenAI integration with fallback to rule-based

import OpenAI from 'openai';

interface SummaryMetrics {
  totalTrades: number;
  winRate: number;
  expectancy: number;
  profitFactor: number;
  ruleViolations: number;
}

const client = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

export async function generateAISummary(
  metrics: SummaryMetrics,
  period: string = 'monthly'
): Promise<string> {
  if (!client) {
    return generateFallbackSummary(metrics, period);
  }

  try {
    const prompt = `Generate a brief trading analysis summary based on these metrics for the ${period} period:
- Total Trades: ${metrics.totalTrades}
- Win Rate: ${metrics.winRate.toFixed(2)}%
- Expectancy: ${metrics.expectancy.toFixed(2)}
- Profit Factor: ${metrics.profitFactor.toFixed(2)}
- Rule Violations: ${metrics.ruleViolations}

Provide actionable insights and recommendations.`;

    const response = await client.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 500,
      temperature: 0.7,
    });

    return response.choices[0].message.content || generateFallbackSummary(metrics, period);
  } catch (error) {
    console.error('AI Summary error:', error);
    return generateFallbackSummary(metrics, period);
  }
}

function generateFallbackSummary(metrics: SummaryMetrics, period: string): string {
  const parts: string[] = [];

  parts.push(`**${period.charAt(0).toUpperCase() + period.slice(1)} Trading Summary**\n`);
  parts.push(`Completed ${metrics.totalTrades} trades with a ${metrics.winRate.toFixed(1)}% win rate.\n`);

  if (metrics.winRate >= 55) {
    parts.push('📈 Strong performance this period. Maintain current strategy.\n');
  } else if (metrics.winRate >= 45) {
    parts.push('➡️ Average performance. Review rule adherence.\n');
  } else {
    parts.push('📉 Below target win rate. Analyze violations and adjust rules.\n');
  }

  if (metrics.ruleViolations > metrics.totalTrades * 0.3) {
    parts.push('⚠️ High rule violation rate. Focus on discipline next period.\n');
  }

  if (metrics.profitFactor > 2) {
    parts.push('💪 Excellent profit factor. Scale up if comfortable.\n');
  } else if (metrics.profitFactor < 1) {
    parts.push('⚡ Losses exceed wins. Pause trading and review strategy.\n');
  }

  return parts.join('');
}

export async function generateFeedbackActions(
  metrics: SummaryMetrics
): Promise<{ action: 'CONTINUE' | 'EXPERIMENT' | 'STOP'; reason: string }[]> {
  const actions: { action: 'CONTINUE' | 'EXPERIMENT' | 'STOP'; reason: string }[] = [];

  if (metrics.winRate >= 60 && metrics.profitFactor > 2) {
    actions.push({
      action: 'CONTINUE',
      reason: 'Strong strategy performance. Continue with current approach.',
    });
  }

  if (metrics.winRate >= 45 && metrics.winRate < 55) {
    actions.push({
      action: 'EXPERIMENT',
      reason: 'Average performance. Test new entry models or timeframes.',
    });
  }

  if (metrics.ruleViolations > metrics.totalTrades * 0.4) {
    actions.push({
      action: 'STOP',
      reason: 'Excessive rule violations detected. Stop trading until you improve discipline.',
    });
  }

  if (metrics.profitFactor < 1) {
    actions.push({
      action: 'STOP',
      reason: 'Strategy is unprofitable. Review and fix before continuing.',
    });
  }

  return actions;
}
