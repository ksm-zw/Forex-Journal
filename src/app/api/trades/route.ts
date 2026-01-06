import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import path from 'path';

let prisma: PrismaClient | null = null;
try {
  prisma = new PrismaClient();
} catch (e) {
  console.warn('Prisma client failed to initialize', e);
  prisma = null;
}

function loadDemoTrades() {
  try {
    const dataPath = path.join(process.cwd(), 'data', 'demo-trades.json');
    const raw = readFileSync(dataPath, 'utf-8');
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load demo trades file', e);
    return [];
  }
}

export async function GET(request: NextRequest) {
  const userId = request.headers.get('x-user-id') || 'demo-user';

  try {
    const { searchParams } = new URL(request.url);
    const pair = searchParams.get('pair');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const outcome = searchParams.get('outcome');
    const status = searchParams.get('status');
    const account = searchParams.get('account');
    const strategy = searchParams.get('strategy');

    const where: any = { userId };

    if (pair) where.pair = pair;
    if (outcome) where.outcome = outcome;
    if (status) where.status = status;
    if (account) where.account = account;
    if (strategy) where.strategy = strategy;
    if (startDate || endDate) {
      where.entryTime = {};
      if (startDate) where.entryTime.gte = new Date(startDate);
      if (endDate) where.entryTime.lte = new Date(endDate);
    }

    if (!prisma) {
      console.warn('Prisma not available, returning demo trades');
      // Optionally, apply filters on demo data
      const demoAll = loadDemoTrades();
      const demo = (demoAll as any[])
        .filter((t: any) => t.userId === userId || !t.userId)
        .slice(0, 100);
      return NextResponse.json(demo);
    }

    const trades = await prisma.trade.findMany({
      where,
      orderBy: { entryTime: 'desc' },
      include: {
        screenshots: true,
        voiceNotes: true,
      },
    });

    return NextResponse.json(trades);
  } catch (error) {
    console.error('Error fetching trades:', error);
    // On error, fall back to demo data so the frontend remains usable
    const demoAll = loadDemoTrades();
    const demo = (demoAll as any[])
      .filter((t: any) => t.userId === userId || !t.userId)
      .slice(0, 100);
    return NextResponse.json(demo);
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id') || 'demo-user';
    const body = await request.json();

    if (!prisma) {
      return NextResponse.json({ error: 'Prisma not available' }, { status: 503 });
    }

    const trade = await prisma.trade.create({
      data: {
        userId,
        pair: body.pair,
        direction: body.direction,
        entryPrice: parseFloat(body.entryPrice),
        exitPrice: body.exitPrice ? parseFloat(body.exitPrice) : null,
        entryTime: new Date(body.entryTime),
        exitTime: body.exitTime ? new Date(body.exitTime) : null,
        volume: parseFloat(body.volume || 0),
        stopLoss: body.stopLoss ? parseFloat(body.stopLoss) : null,
        takeProfit: body.takeProfit ? parseFloat(body.takeProfit) : null,
        riskAmount: body.riskAmount ? parseFloat(body.riskAmount) : null,
        riskPercent: body.riskPercent ? parseFloat(body.riskPercent) : null,
        riskRewardRatio: body.riskRewardRatio ? parseFloat(body.riskRewardRatio) : null,
        account: body.account,
        broker: body.broker,
        accountBalance: body.accountBalance ? parseFloat(body.accountBalance) : null,
        accountEquity: body.accountEquity ? parseFloat(body.accountEquity) : null,
        profitLoss: body.profitLoss ? parseFloat(body.profitLoss) : null,
        profitLossPercent: body.profitLossPercent ? parseFloat(body.profitLossPercent) : null,
        outcome: body.outcome,
        status: body.status || 'open',
        strategy: body.strategy,
        setupType: body.setupType,
        notes: body.notes,
        emotionalState: body.emotionalState,
        setupQuality: body.setupQuality ? parseInt(body.setupQuality) : null,
        whatLearned: body.whatLearned,
        mistakes: body.mistakes ? JSON.stringify(body.mistakes) : null,
      },
      include: {
        screenshots: true,
        voiceNotes: true,
      },
    });

    return NextResponse.json(trade, { status: 201 });
  } catch (error) {
    console.error('Error creating trade:', error);
    return NextResponse.json({ error: 'Failed to create trade' }, { status: 500 });
  }
}