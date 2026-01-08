import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * PUT /api/trades/[id]
 * Update a trade with extended research lab fields
 */
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    // Parse numeric and date fields safely
    const parseFloat_ = (val: any): number | null => (val ? parseFloat(val) : null);
    const parseDate = (val: any): Date | null => (val ? new Date(val) : null);

    const updated = await prisma.trade.update({
      where: { id: tradeId },
      data: {
        strategy_id: body.strategy_id ?? trade.strategy_id,
        entry_model_id: body.entry_model_id ?? trade.entry_model_id,
        pair: body.pair ?? trade.pair,
        direction: body.direction ?? trade.direction,
        entryPrice: parseFloat_(body.entryPrice) ?? trade.entryPrice,
        exitPrice: parseFloat_(body.exitPrice) ?? trade.exitPrice,
        entryTime: parseDate(body.entryTime) ?? trade.entryTime,
        exitTime: parseDate(body.exitTime) ?? trade.exitTime,
        volume: parseFloat_(body.volume) ?? trade.volume,
        stopLoss: parseFloat_(body.stopLoss) ?? trade.stopLoss,
        takeProfit: parseFloat_(body.takeProfit) ?? trade.takeProfit,
        planned_entry: parseFloat_(body.planned_entry) ?? trade.planned_entry,
        planned_sl: parseFloat_(body.planned_sl) ?? trade.planned_sl,
        planned_tp: parseFloat_(body.planned_tp) ?? trade.planned_tp,
        test_mode: body.test_mode ?? trade.test_mode,
        rules_followed: body.rules_followed ?? trade.rules_followed,
        notes: body.notes ?? trade.notes,
      },
    });

    return NextResponse.json({ success: true, trade: updated });
  } catch (error) {
    console.error('Error updating trade:', error);
    return NextResponse.json({ error: 'Failed to update trade' }, { status: 500 });
  }
}

/**
 * DELETE /api/trades/[id]
 * Delete a trade and all associated compliance records
 */
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    // Delete with cascade (compliance records deleted automatically)
    await prisma.trade.delete({ where: { id: tradeId } });

    return NextResponse.json({ success: true, message: 'Trade deleted' });
  } catch (error) {
    console.error('Error deleting trade:', error);
    return NextResponse.json({ error: 'Failed to delete trade' }, { status: 500 });
  }
}
