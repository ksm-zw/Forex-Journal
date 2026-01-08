import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  timeframeSequenceAnalysis,
} from '@/lib/analytics';

/**
 * GET /api/analytics/timeframe-performance
 * Analyze which timeframe sequences perform best
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

    let user = await prisma.user.findUnique({ where: { email: userIdentifier } });
    if (!user) user = await prisma.user.findUnique({ where: { id: userIdentifier } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const trades = await prisma.trade.findMany({
      where: { userId: user.id },
      include: {
        timeframe_compliance: {
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });

    const analysis = timeframeSequenceAnalysis(
      trades,
      trades.flatMap((t) => t.timeframe_compliance)
    );

    return NextResponse.json({
      success: true,
      sequencePerformance: analysis,
    });
  } catch (error) {
    console.error('Error analyzing timeframe performance:', error);
    return NextResponse.json(
      { error: 'Failed to analyze timeframe performance' },
      { status: 500 }
    );
  }
}
