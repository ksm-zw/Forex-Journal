import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateRuleBasedSummary } from '@/lib/analytics';

export async function POST(request: NextRequest) {
  try {
    const userIdentifier = request.headers.get('x-user-id') || 'demo@forex-research.com';
    const body = await request.json();
    const { period_type = 'month', start_date, end_date } = body;

    if (!prisma) {
      return NextResponse.json({ error: 'Database not available' }, { status: 503 });
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

    const trades = await prisma.trade.findMany({
      where: { userId: user.id },
      include: { rule_compliance: true, strategy: true },
    });

    const summary = generateRuleBasedSummary(
      {
        totalTrades: trades.length,
        closedTrades: trades.filter((t) => t.exitPrice).length,
        wins: trades.filter((t) => t.exitPrice && t.exitPrice > t.entryPrice).length,
        losses: trades.filter((t) => t.exitPrice && t.exitPrice < t.entryPrice).length,
        winRate: 0,
        totalRR: 0,
        expectancy: 0,
        profitFactor: 0,
      },
      (await prisma.strategy.findMany({ where: { userId: user.id } })) as any,
      trades
    );

    const storedSummary = await prisma.summary.create({
      data: {
        userId: user.id,
        period_type,
        start_date: start_date ? new Date(start_date) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        end_date: end_date ? new Date(end_date) : new Date(),
        summary_mode: 'rule_based',
        content: JSON.stringify(summary),
        feedback_actions: JSON.stringify([]),
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
    const userIdentifier = request.headers.get('x-user-id') || 'demo@forex-research.com';

    if (!prisma) {
      return NextResponse.json({ error: 'Database not available' }, { status: 503 });
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

    const summaries = await prisma.summary.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, summaries });
  } catch (error) {
    console.error('Error fetching summaries:', error);
    return NextResponse.json({ error: 'Failed to fetch summaries' }, { status: 500 });
  }
}
