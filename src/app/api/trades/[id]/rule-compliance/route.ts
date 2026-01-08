import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/trades/[id]/rule-compliance
 * Get rule compliance records for a trade
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userIdentifier = request.headers.get('x-user-id') || 'demo@forex-research.com';
    const { id: tradeId } = await params;

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

    // Verify trade ownership
    const trade = await prisma.trade.findFirst({ where: { id: tradeId, userId: user.id } });
    if (!trade) {
      return NextResponse.json({ error: 'Trade not found' }, { status: 404 });
    }

    const records = await prisma.tradeRuleCompliance.findMany({
      where: { trade_id: tradeId },
      include: { rule: true },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json({ success: true, records });
  } catch (error) {
    console.error('Error fetching rule compliance:', error);
    return NextResponse.json({ error: 'Failed to fetch compliance records' }, { status: 500 });
  }
}

/**
 * POST /api/trades/[id]/rule-compliance
 * Create a rule compliance record for a trade
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userIdentifier = request.headers.get('x-user-id') || 'demo@forex-research.com';
    const { id: tradeId } = await params;
    const body = await request.json();

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

    // Verify trade ownership
    const trade = await prisma.trade.findFirst({ where: { id: tradeId, userId: user.id } });
    if (!trade) {
      return NextResponse.json({ error: 'Trade not found' }, { status: 404 });
    }

    // Validate required fields
    if (!body.rule_id) {
      return NextResponse.json({ error: 'Missing rule_id' }, { status: 400 });
    }

    // Verify rule exists and belongs to user's strategy
    const rule = await prisma.strategyRule.findFirst({
      where: {
        id: body.rule_id,
        strategy: { userId: user.id },
      },
    });

    if (!rule) {
      return NextResponse.json({ error: 'Rule not found' }, { status: 404 });
    }

    const record = await prisma.tradeRuleCompliance.create({
      data: {
        trade_id: tradeId,
        rule_id: body.rule_id,
        followed: body.followed ?? true,
        notes: body.notes || null,
      },
    });

    return NextResponse.json({ success: true, record });
  } catch (error) {
    console.error('Error creating rule compliance:', error);
    return NextResponse.json({ error: 'Failed to create compliance record' }, { status: 500 });
  }
}
