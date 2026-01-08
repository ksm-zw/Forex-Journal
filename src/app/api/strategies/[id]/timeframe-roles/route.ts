import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/strategies/[id]/timeframe-roles
 * List timeframe roles for a strategy
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

    const timeframeRoles = await prisma.timeframeRole.findMany({
      where: { strategy_id: strategyId },
      orderBy: { order_index: 'asc' },
    });

    return NextResponse.json({ success: true, timeframeRoles });
  } catch (error) {
    console.error('Error fetching timeframe roles:', error);
    return NextResponse.json(
      { error: 'Failed to fetch timeframe roles' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/strategies/[id]/timeframe-roles
 * Create a timeframe role under a strategy
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

    if (!body.timeframe || !body.role_type || body.order_index === undefined) {
      return NextResponse.json(
        { error: 'Timeframe, role_type, and order_index are required' },
        { status: 400 }
      );
    }

    const timeframeRole = await prisma.timeframeRole.create({
      data: {
        strategy_id: strategyId,
        entry_model_id: body.entry_model_id || null,
        timeframe: body.timeframe,
        role_type: body.role_type,
        order_index: body.order_index,
        description: body.description || '',
      },
    });

    return NextResponse.json(
      { success: true, timeframeRole },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating timeframe role:', error);
    return NextResponse.json(
      { error: 'Failed to create timeframe role' },
      { status: 500 }
    );
  }
}
