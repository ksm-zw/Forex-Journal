import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { readFileSync } from 'fs';
import path from 'path';

function loadDemoTrades() {
  const possible = [
    path.join(process.cwd(), 'data', 'demo-trades.json'),
    path.join(process.cwd(), 'src', 'data', 'demo-trades.json'),
    path.join(process.cwd(), 'public', 'data', 'demo-trades.json'),
  ];

  for (const p of possible) {
    try {
      const raw = readFileSync(p, 'utf-8');
      return JSON.parse(raw);
    } catch (e) {
      // try next
    }
  }
  return [];
}

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id') || 'demo-user';
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'csv'; // csv or json
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const where: any = { userId };
    if (startDate || endDate) {
      where.entryTime = {};
      if (startDate) where.entryTime.gte = new Date(startDate);
      if (endDate) where.entryTime.lte = new Date(endDate);
    }

    let trades: any[] = [];

    if (!prisma) {
      console.warn('Prisma not available in export route; falling back to demo data');
      trades = loadDemoTrades().filter((t: any) => t.userId === userId || !t.userId);
    } else {
      trades = await prisma.trade.findMany({
        where,
        include: {
          screenshots: true,
          voiceNotes: true,
        },
        orderBy: { entryTime: 'asc' },
      });
    }

    if (format === 'json') {
      return NextResponse.json(trades, {
        headers: {
          'Content-Disposition':
            `attachment; filename="trades_${new Date().toISOString().split('T')[0]}.json"`,
          'Content-Type': 'application/json',
        },
      });
    }

    // CSV Format
    if (format === 'csv') {
      const csvHeaders = [
        'Date',
        'Pair',
        'Direction',
        'Entry Price',
        'Exit Price',
        'SL',
        'TP',
        'Volume',
        'Outcome',
        'P&L',
        'P&L %',
        'Risk %',
        'RRR',
        'Account',
        'Broker',
        'Strategy',
        'Emotional State',
        'Setup Quality',
        'Notes',
      ];

      const csvRows = trades.map((trade) => {
        const t: any = trade;
        return [
          t.entryTime.toISOString().split('T')[0],
          t.pair,
          t.direction,
          t.entryPrice,
          t.exitPrice || '',
          t.stopLoss || '',
          t.takeProfit || '',
          t.volume,
          t.outcome || 'OPEN',
          t.profitLoss || '',
          t.profitLossPercent || '',
          t.riskPercent || '',
          t.riskRewardRatio || '',
          t.account || '',
          t.broker || '',
          t.strategy || '',
          t.emotionalState || '',
          t.setupQuality || '',
          (t.notes || '').replace(/"/g, '""'),
        ];
      });

      const csv = [
        csvHeaders.map((h) => `"${h}"`).join(','),
        ...csvRows.map((row) =>
          row.map((cell) => {
            if (typeof cell === 'string') {
              return `"${cell}"`;
            }
            return cell;
          }).join(',')
        ),
      ].join('\n');

      return NextResponse.json(
        { csv },
        {
          headers: {
            'Content-Disposition':
              `attachment; filename="trades_${new Date().toISOString().split('T')[0]}.csv"`,
            'Content-Type': 'text/csv; charset=utf-8',
          },
        }
      );
    }

    return NextResponse.json(
      { error: 'Invalid format. Use csv or json.' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error exporting trades:', error);
    return NextResponse.json({ error: 'Failed to export trades' }, { status: 500 });
  }
}
