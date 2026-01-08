import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateRuleBasedSummary } from '@/lib/analytics';

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id') || 'demo-user';
    const body = await request.json();
    const { strategy_id, period } = body;

    if (!prisma) {
      return NextResponse.json({ error: 'Database not available' }, { status: 503 });
    }

    if (!strategy_id) {
      return NextResponse.json({ error: 'Missing strategy_id' }, { status: 400 });
    }

    const strategy = await prisma.strategy.findFirst({
      where: { id: strategy_id, userId },
      include: { trades: { include: { rule_compliance: true } } },
    });

    if (!strategy) {
      return NextResponse.json({ error: 'Strategy not found' }, { status: 404 });
    }

    const summary = generateRuleBasedSummary(
      {
        totalTrades: strategy.trades.length,
        closedTrades: strategy.trades.filter((t) => t.exitPrice).length,
        wins: 0,
        losses: 0,
        winRate: 0,
        totalRR: 0,
        expectancy: 0,
        profitFactor: 0,
      },
      [strategy],
      strategy.trades
    );

    const storedSummary = await prisma.summary.create({
      data: {
        userId,
        strategy_id,
        period: period || 'monthly',
        insights: summary.insights || [],
        actions: JSON.stringify(summary),
      },
    });

    return NextResponse.json({ success: true, summary: storedSummary });
  } catch (error) {
    console.error('Error generating summary:', error);
    return NextResponse.json({ error: 'Failed to generate summary' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id') || 'demo-user';

    if (!prisma) {
      return NextResponse.json({ error: 'Database not available' }, { status: 503 });
    }

    const summaries = await prisma.summary.findMany({
      where: { userId },
      include: { strategy: true },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, summaries });
  } catch (error) {
    console.error('Error fetching summaries:', error);
    return NextResponse.json({ error: 'Failed to fetch summaries' }, { status: 500 });
  }
}
