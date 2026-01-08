import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/strategies/[id]
 * Fetch a single strategy with all relations
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = request.headers.get('x-user-id') || 'demo-user';

    if (!prisma) {
      return NextResponse.json(
        { error: 'Database not available' },
        { status: 503 }
      );
    }

    const strategy = await prisma.strategy.findUnique({
      where: { id },
      include: {
        entry_models: true,
        timeframe_roles: { orderBy: { order_index: 'asc' } },
        rules: true,
        trades: { select: { id: true } },
      },
    });

    if (!strategy || strategy.userId !== userId) {
      return NextResponse.json(
        { error: 'Strategy not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, strategy });
  } catch (error) {
    console.error('Error fetching strategy:', error);
    return NextResponse.json(
      { error: 'Failed to fetch strategy' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/strategies/[id]
 * Update a strategy
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = request.headers.get('x-user-id') || 'demo-user';
    const body = await request.json();

    if (!prisma) {
      return NextResponse.json(
        { error: 'Database not available' },
        { status: 503 }
      );
    }

    const strategy = await prisma.strategy.findUnique({
      where: { id },
    });

    if (!strategy || strategy.userId !== userId) {
      return NextResponse.json(
        { error: 'Strategy not found' },
        { status: 404 }
      );
    }

    const updated = await prisma.strategy.update({
      where: { id },
      data: {
        strategy_name: body.strategy_name || strategy.strategy_name,
        description: body.description ?? strategy.description,
        market_type: body.market_type || strategy.market_type,
        allowed_sessions: body.allowed_sessions || strategy.allowed_sessions,
        max_trades_per_day: body.max_trades_per_day ?? strategy.max_trades_per_day,
        default_risk_percent: body.default_risk_percent ?? strategy.default_risk_percent,
        expected_rr_min: body.expected_rr_min ?? strategy.expected_rr_min,
        status: body.status || strategy.status,
      },
    });

    return NextResponse.json({ success: true, strategy: updated });
  } catch (error) {
    console.error('Error updating strategy:', error);
    return NextResponse.json(
      { error: 'Failed to update strategy' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/strategies/[id]
 * Delete a strategy (cascade deletes related data)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = request.headers.get('x-user-id') || 'demo-user';

    if (!prisma) {
      return NextResponse.json(
        { error: 'Database not available' },
        { status: 503 }
      );
    }

    const strategy = await prisma.strategy.findUnique({
      where: { id },
    });

    if (!strategy || strategy.userId !== userId) {
      return NextResponse.json(
        { error: 'Strategy not found' },
        { status: 404 }
      );
    }

    await prisma.strategy.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Strategy deleted' });
  } catch (error) {
    console.error('Error deleting strategy:', error);
    return NextResponse.json(
      { error: 'Failed to delete strategy' },
      { status: 500 }
    );
  }
}
