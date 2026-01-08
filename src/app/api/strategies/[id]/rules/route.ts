import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/strategies/[id]/rules
 * List rules for a strategy
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: strategyId } = await params;
    const userId = request.headers.get('x-user-id') || 'demo-user';

    if (!prisma) {
      return NextResponse.json(
        { error: 'Database not available' },
        { status: 503 }
      );
    }

    const strategy = await prisma.strategy.findUnique({
      where: { id: strategyId },
    });

    if (!strategy || strategy.userId !== userId) {
      return NextResponse.json(
        { error: 'Strategy not found' },
        { status: 404 }
      );
    }

    const rules = await prisma.strategyRule.findMany({
      where: { strategy_id: strategyId },
    });

    return NextResponse.json({ success: true, rules });
  } catch (error) {
    console.error('Error fetching rules:', error);
    return NextResponse.json(
      { error: 'Failed to fetch rules' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/strategies/[id]/rules
 * Create a rule under a strategy
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: strategyId } = await params;
    const userId = request.headers.get('x-user-id') || 'demo-user';
    const body = await request.json();

    if (!prisma) {
      return NextResponse.json(
        { error: 'Database not available' },
        { status: 503 }
      );
    }

    const strategy = await prisma.strategy.findUnique({
      where: { id: strategyId },
    });

    if (!strategy || strategy.userId !== userId) {
      return NextResponse.json(
        { error: 'Strategy not found' },
        { status: 404 }
      );
    }

    if (!body.description) {
      return NextResponse.json(
        { error: 'Rule description is required' },
        { status: 400 }
      );
    }

    const rule = await prisma.strategyRule.create({
      data: {
        strategy_id: strategyId,
        description: body.description,
        rule_type: body.rule_type || 'optional',
        weight: body.weight || 1.0,
      },
    });

    return NextResponse.json(
      { success: true, rule },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating rule:', error);
    return NextResponse.json(
      { error: 'Failed to create rule' },
      { status: 500 }
    );
  }
}
