import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = request.headers.get('x-user-id') || 'demo-user';

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

    const trade = await prisma.trade.findUnique({
      where: { id },
    });

    if (!trade || trade.userId !== userId) {
      return NextResponse.json({ error: 'Trade not found' }, { status: 404 });
    }

    const t: any = trade;
    const updatedTrade = await prisma.trade.update({
      where: { id },
      data: {
        pair: body.pair || t.pair,
        direction: body.direction || t.direction,
        entryPrice: body.entryPrice ? parseFloat(body.entryPrice) : t.entryPrice,
        exitPrice: body.exitPrice ? parseFloat(body.exitPrice) : t.exitPrice,
        entryTime: body.entryTime ? new Date(body.entryTime) : t.entryTime,
        exitTime: body.exitTime ? new Date(body.exitTime) : t.exitTime,
        volume: body.volume ? parseFloat(body.volume) : t.volume,
        stopLoss: body.stopLoss ? parseFloat(body.stopLoss) : t.stopLoss,
        takeProfit: body.takeProfit ? parseFloat(body.takeProfit) : t.takeProfit,
        riskAmount: body.riskAmount ? parseFloat(body.riskAmount) : t.riskAmount,
        riskPercent: body.riskPercent ? parseFloat(body.riskPercent) : t.riskPercent,
        riskRewardRatio: body.riskRewardRatio ? parseFloat(body.riskRewardRatio) : t.riskRewardRatio,
        account: body.account || t.account,
        broker: body.broker || t.broker,
        accountBalance: body.accountBalance ? parseFloat(body.accountBalance) : t.accountBalance,
        accountEquity: body.accountEquity ? parseFloat(body.accountEquity) : t.accountEquity,
        profitLoss: body.profitLoss !== undefined ? parseFloat(body.profitLoss) : t.profitLoss,
        profitLossPercent: body.profitLossPercent ? parseFloat(body.profitLossPercent) : t.profitLossPercent,
        outcome: body.outcome || t.outcome,
        status: body.status || t.status,
        strategy: body.strategy || t.strategy,
        setupType: body.setupType || t.setupType,
        notes: body.notes || t.notes,
        emotionalState: body.emotionalState || t.emotionalState,
        setupQuality: body.setupQuality ? parseInt(body.setupQuality) : t.setupQuality,
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
