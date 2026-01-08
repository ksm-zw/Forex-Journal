import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/strategies
 * List all strategies for the authenticated user with counts
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

    // Find user by email or ID
    let user = await prisma.user.findUnique({
      where: { email: userIdentifier },
    });

    // If not found by email, try by ID
    if (!user) {
      user = await prisma.user.findUnique({
        where: { id: userIdentifier },
      });
    }

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const strategies = await prisma.strategy.findMany({
      where: { userId: user.id },
      include: {
        _count: {
          select: { trades: true, entry_models: true, rules: true, timeframe_roles: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, strategies });
  } catch (error) {
    console.error('Error fetching strategies:', error);
    return NextResponse.json(
      { error: 'Failed to fetch strategies' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/strategies
 * Create a new strategy
 */
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id') || 'demo-user';
    const body = await request.json();

    if (!prisma) {
      return NextResponse.json(
        { error: 'Database not available' },
        { status: 503 }
      );
    }

    if (!body.strategy_name) {
      return NextResponse.json(
        { error: 'Strategy name is required' },
        { status: 400 }
      );
    }

    const strategy = await prisma.strategy.create({
      data: {
        userId,
        strategy_name: body.strategy_name,
        description: body.description || '',
        market_type: body.market_type || 'mixed',
        allowed_sessions: body.allowed_sessions || 'Asia,London,NY',
        max_trades_per_day: body.max_trades_per_day || 5,
        default_risk_percent: body.default_risk_percent || 2.0,
        expected_rr_min: body.expected_rr_min || 1.5,
        status: 'active',
      },
    });

    return NextResponse.json(
      { success: true, strategy },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating strategy:', error);
    return NextResponse.json(
      { error: 'Failed to create strategy' },
      { status: 500 }
    );
  }
}
