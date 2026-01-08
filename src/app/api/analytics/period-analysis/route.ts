import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  groupTradesByPeriod,
  periodMetrics,
} from '@/lib/analytics';

/**
 * GET /api/analytics/period-analysis
 * Analyze trades by time period (day, week, month, quarter, half, year)
 * Query params: ?period=month (default: month)
 */
export async function GET(request: NextRequest) {
  try {
    const userIdentifier = request.headers.get('x-user-id') || 'demo@forex-research.com';
    const url = new URL(request.url);
    const period = (url.searchParams.get('period') || 'month') as
      | 'day'
      | 'week'
      | 'month'
      | 'quarter'
      | 'half'
      | 'year';

    if (!prisma) {
      return NextResponse.json(
        { error: 'Database not available' },
        { status: 503 }
      );
    }

    let user = await prisma.user.findUnique({ where: { email: userIdentifier } });
    if (!user) user = await prisma.user.findUnique({ where: { id: userIdentifier } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const trades = await prisma.trade.findMany({
      where: { userId: user.id },
      include: {
        rule_compliance: true,
        timeframe_compliance: true,
      },
      orderBy: { entryTime: 'asc' },
    });

    const grouped = groupTradesByPeriod(trades, period);
    const analysis: Record<string, any> = {};

    for (const periodKey in grouped) {
      analysis[periodKey] = periodMetrics(grouped[periodKey]);
    }

    return NextResponse.json({
      success: true,
      period,
      analysis,
    });
  } catch (error) {
    console.error('Error analyzing periods:', error);
    return NextResponse.json(
      { error: 'Failed to analyze periods' },
      { status: 500 }
    );
  }
}
