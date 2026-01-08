import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  calculateMetricsByStrategy,
  calculateRuleViolationImpact,
  groupTradesByPeriod,
  periodMetrics,
  timeframeSequenceAnalysis,
  generateRuleBasedSummary,
} from '@/lib/analytics';

/**
 * GET /api/analytics/strategy-comparison
 * Compare metrics across all strategies for the user
 */
export async function GET(request: NextRequest) {
  try {
    const userIdentifier = request.headers.get('x-user-id') || 'demo@forex-research.com';

    if (!prisma) {
      return NextResponse.json(
        { error: 'Database not available' },
        { status: 503 }
      );
    }

    let user = await prisma.user.findUnique({
      where: { email: userIdentifier },
    });

    if (!user) {
      user = await prisma.user.findUnique({
        where: { id: userIdentifier },
      });
    }

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const strategies = await prisma.strategy.findMany({
      where: { userId: user.id },
      include: {
        trades: {
          include: {
            rule_compliance: true,
            timeframe_compliance: true,
          },
        },
      },
    });

    const analysis: Record<string, any> = {};

    for (const strategy of strategies) {
      const metrics = calculateMetricsByStrategy(strategy.trades);
      const ruleViolationImpact = calculateRuleViolationImpact(
        strategy.trades,
        strategy.trades.flatMap((t) => t.rule_compliance)
      );

      analysis[strategy.id] = {
        name: strategy.strategy_name,
        ...metrics,
        ruleViolationImpact,
      };
    }

    return NextResponse.json({
      success: true,
      analysis,
    });
  } catch (error) {
    console.error('Error analyzing strategies:', error);
    return NextResponse.json(
      { error: 'Failed to analyze strategies' },
      { status: 500 }
    );
  }
}
