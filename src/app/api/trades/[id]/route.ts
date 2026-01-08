import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = request.headers.get('x-user-id') || 'demo-user';

    if (!prisma) {
      return NextResponse.json({ error: 'Prisma not available' }, { status: 503 });
    }

    const trade = await prisma.trade.findUnique({
      where: { id },
      include: {
        screenshots: true,
        voiceNotes: true,
      },
    });

    if (!trade || trade.userId !== userId) {
      return NextResponse.json({ error: 'Trade not found' }, { status: 404 });
    }

    return NextResponse.json(trade);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch trade' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = request.headers.get('x-user-id') || 'demo-user';
    const body = await request.json();

    if (!prisma) {
      return NextResponse.json({ error: 'Prisma not available' }, { status: 503 });
    }

    const trade = await prisma.trade.findUnique({
      where: { id },
    });

    if (!trade || trade.userId !== userId) {
      return NextResponse.json({ error: 'Trade not found' }, { status: 404 });
    }

    const t: any = trade;

    const parseNumber = (v: any) => {
      if (v === undefined || v === null || v === '') return undefined;
      const n = parseFloat(v as any);
      return isNaN(n) ? undefined : n;
    };

    const parseInteger = (v: any) => {
      if (v === undefined || v === null || v === '') return undefined;
      const n = parseInt(v as any);
      return isNaN(n) ? undefined : n;
    };

    const parseDate = (v: any) => {
      if (!v) return undefined;
      const d = new Date(v);
      return isNaN(d.getTime()) ? undefined : d;
    };

    const updatedTrade = await prisma.trade.update({
      where: { id },
      data: {
        pair: body.pair || t.pair,
        direction: body.direction || t.direction,
        entryPrice: parseNumber(body.entryPrice) ?? t.entryPrice,
        exitPrice: parseNumber(body.exitPrice) ?? t.exitPrice,
        entryTime: parseDate(body.entryTime) ?? t.entryTime,
        exitTime: parseDate(body.exitTime) ?? t.exitTime,
        volume: parseNumber(body.volume) ?? t.volume,
        stopLoss: parseNumber(body.stopLoss) ?? t.stopLoss,
        takeProfit: parseNumber(body.takeProfit) ?? t.takeProfit,
        riskAmount: parseNumber(body.riskAmount) ?? t.riskAmount,
        riskPercent: parseNumber(body.riskPercent) ?? t.riskPercent,
        riskRewardRatio: parseNumber(body.riskRewardRatio) ?? t.riskRewardRatio,
        account: body.account || t.account,
        broker: body.broker || t.broker,
        accountBalance: parseNumber(body.accountBalance) ?? t.accountBalance,
        accountEquity: parseNumber(body.accountEquity) ?? t.accountEquity,
        profitLoss: (body.profitLoss !== undefined && body.profitLoss !== null) ? parseNumber(body.profitLoss) ?? t.profitLoss : t.profitLoss,
        profitLossPercent: parseNumber(body.profitLossPercent) ?? t.profitLossPercent,
        outcome: body.outcome || t.outcome,
        status: body.status || t.status,
        strategy: body.strategy || t.strategy,
        setupType: body.setupType || t.setupType,
        notes: body.notes || t.notes,
        emotionalState: body.emotionalState || t.emotionalState,
        setupQuality: parseInteger(body.setupQuality) ?? t.setupQuality,
        whatLearned: body.whatLearned || t.whatLearned,
        mistakes: body.mistakes ? JSON.stringify(body.mistakes) : t.mistakes,
      } as any,
      include: {
        screenshots: true,
        voiceNotes: true,
      },
    });

    return NextResponse.json(updatedTrade);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update trade' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = request.headers.get('x-user-id') || 'demo-user';

    if (!prisma) {
      return NextResponse.json({ error: 'Prisma not available' }, { status: 503 });
    }

    const trade = await prisma.trade.findUnique({
      where: { id },
    });

    if (!trade || trade.userId !== userId) {
      return NextResponse.json({ error: 'Trade not found' }, { status: 404 });
    }

    await prisma.trade.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Trade deleted' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete trade' }, { status: 500 });
  }
}
