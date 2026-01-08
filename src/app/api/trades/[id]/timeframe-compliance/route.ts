import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/trades/[id]/timeframe-compliance
 * Get timeframe compliance records for a trade
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = request.headers.get('x-user-id') || 'demo-user';
    const { id: tradeId } = await params;

    if (!prisma) {
      return NextResponse.json({ error: 'Database not available' }, { status: 503 });
    }

    // Verify trade ownership
    const trade = await prisma.trade.findFirst({ where: { id: tradeId, userId } });
    if (!trade) {
      return NextResponse.json({ error: 'Trade not found' }, { status: 404 });
    }

    const records = await prisma.tradeTimeframeCompliance.findMany({
      where: { trade_id: tradeId },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json({ success: true, records });
  } catch (error) {
    console.error('Error fetching timeframe compliance:', error);
    return NextResponse.json({ error: 'Failed to fetch compliance records' }, { status: 500 });
  }
}

/**
 * POST /api/trades/[id]/timeframe-compliance
 * Create a timeframe compliance record for a trade
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = request.headers.get('x-user-id') || 'demo-user';
    const { id: tradeId } = await params;
    const body = await request.json();

    if (!prisma) {
      return NextResponse.json({ error: 'Database not available' }, { status: 503 });
    }

    // Verify trade ownership
    const trade = await prisma.trade.findFirst({ where: { id: tradeId, userId } });
    if (!trade) {
      return NextResponse.json({ error: 'Trade not found' }, { status: 404 });
    }

    // Validate required fields
    if (!body.timeframe || !body.role_type) {
      return NextResponse.json({ error: 'Missing timeframe or role_type' }, { status: 400 });
    }

    const record = await prisma.tradeTimeframeCompliance.create({
      data: {
        trade_id: tradeId,
        timeframe: body.timeframe,
        role_type: body.role_type,
        respected: body.respected ?? false,
        notes: body.notes || null,
      },
    });

    return NextResponse.json({ success: true, record });
  } catch (error) {
    console.error('Error creating timeframe compliance:', error);
    return NextResponse.json({ error: 'Failed to create compliance record' }, { status: 500 });
  }
}
