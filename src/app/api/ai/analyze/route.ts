import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { prisma } from '@/lib/prisma';
import { readFileSync } from 'fs';
import path from 'path';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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

interface AnalysisRequest {
  period: 'daily' | 'weekly' | 'monthly';
  startDate?: string;
  endDate?: string;
}

export async function POST(request: NextRequest) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 400 }
      );
    }

    const userId = request.headers.get('x-user-id') || 'demo-user';
    const body: AnalysisRequest = await request.json();

    // Calculate date range
    const now = new Date();
    let startDate = new Date();
    let endDate = new Date();

    if (body.period === 'daily') {
      startDate.setDate(now.getDate() - 1);
    } else if (body.period === 'weekly') {
      startDate.setDate(now.getDate() - 7);
    } else if (body.period === 'monthly') {
      startDate.setMonth(now.getMonth() - 1);
    }

    if (body.startDate) startDate = new Date(body.startDate);
    if (body.endDate) endDate = new Date(body.endDate);

    // Fetch trades for the period
    let trades: any[] = [];

    if (!prisma) {
      console.warn('Prisma not available in AI analyze; falling back to demo trades');
      trades = loadDemoTrades().filter((t: any) => {
        const d = new Date(t.entryTime);
        return d >= startDate && d <= endDate;
      });
    } else {
      trades = await prisma.trade.findMany({
        where: {
          userId,
          entryTime: {
            gte: startDate,
            lte: endDate,
          },
        },
        include: {
          voiceNotes: true,
          screenshots: true,
        },
        orderBy: { entryTime: 'asc' },
      });
    }

    if (trades.length === 0) {
      return NextResponse.json({
        success: true,
        period: body.period,
        message: 'No trades found for this period',
        summary: 'No trades were journaled during this period. Keep trading and journaling!',
      });
    }

    // Prepare data for AI analysis
    const tradesSummary = trades.map((trade) => {
      const t: any = trade;
      return {
        pair: t.pair,
        direction: t.direction,
        entryPrice: t.entryPrice,
        exitPrice: t.exitPrice,
        outcome: t.outcome || 'open',
        profitLoss: t.profitLoss,
        profitLossPercent: t.profitLossPercent,
        emotionalState: t.emotionalState,
        setupQuality: t.setupQuality,
        strategy: t.strategy,
        notes: t.notes,
        whatLearned: t.whatLearned,
        mistakes: t.mistakes ? JSON.parse(t.mistakes) : [],
        account: t.account,
        riskPercent: t.riskPercent,
        riskRewardRatio: t.riskRewardRatio,
        voiceNotesCount: t.voiceNotes.length,
        screenshotsCount: t.screenshots.length,
      };
    });

    // Calculate key metrics
    const closedTrades = trades.filter((t) => t.outcome && t.outcome !== 'open');
    const wins = closedTrades.filter((t) => t.outcome === 'WIN').length;
    const losses = closedTrades.filter((t) => t.outcome === 'LOSS').length;
    const breakeven = closedTrades.filter((t) => t.outcome === 'BREAKEVEN').length;
    const totalPnL = trades.reduce((sum, t) => sum + (t.profitLoss || 0), 0);
    const avgWin =
      wins > 0
        ? trades
            .filter((t) => t.outcome === 'WIN' && t.profitLoss)
            .reduce((sum, t) => sum + t.profitLoss!, 0) / wins
        : 0;
    const avgLoss =
      losses > 0
        ? trades
            .filter((t) => t.outcome === 'LOSS' && t.profitLoss)
            .reduce((sum, t) => sum + Math.abs(t.profitLoss!), 0) / losses
        : 0;
    const winRate = closedTrades.length > 0 ? (wins / closedTrades.length) * 100 : 0;

    // Create the AI prompt
    const analysisPrompt = `
You are a professional trading psychologist and mentor analyzing a trader's journal entries.

Period: ${body.period}
Date Range: ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}

TRADE DATA:
Total Trades: ${trades.length}
Closed Trades: ${closedTrades.length}
Wins: ${wins}
Losses: ${losses}
Breakeven: ${breakeven}
Win Rate: ${winRate.toFixed(2)}%
Total P&L: $${totalPnL.toFixed(2)}
Average Win: $${avgWin.toFixed(2)}
Average Loss: $${avgLoss.toFixed(2)}

DETAILED TRADES:
${JSON.stringify(tradesSummary, null, 2)}

Based on this trader's journal data, provide a comprehensive analysis in the following structure:

1. **Key Patterns & Observations**: Identify 2-3 observable patterns from their trades (e.g., "Highest win rate came from EUR/USD breakout setups when marked as 'Calm'", or "Losses clustered around 2-3 PM EST"). Reference specific data points.

2. **Emotional & Psychological Insights**: Analyze the correlation between emotional state and outcomes. What emotions preceded their best trades? Worst trades? Include specific evidence from the data.

3. **Risk Management Review**: Comment on their risk-reward ratios, position sizing, and stop loss placement. Are they risking appropriate amounts?

4. **Strategy Performance**: Which pairs/strategies performed best? Worst? Provide actionable insights.

5. **Top 3 Action Items**: Specific, prioritized improvements they can implement immediately based on their journal data.

6. **Positive Reinforcement**: Highlight one specific positive pattern or decision they should repeat.

Keep the analysis encouraging yet brutally honest. Reference their own journal entries and data to make recommendations personal and credible.
`;

    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'user',
          content: analysisPrompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const analysis = response.choices[0].message.content || '';

    // Save the insight to database if available
    let insightId: string | null = null;

    if (prisma) {
      const insight = await prisma.aIInsight.create({
        data: {
          userId,
          type: 'period_analysis',
          period: body.period,
          startDate,
          endDate,
          content: JSON.stringify({
            analysis,
            metrics: {
              totalTrades: trades.length,
              closedTrades: closedTrades.length,
              wins,
              losses,
              breakeven,
              winRate,
              totalPnL,
              avgWin,
              avgLoss,
            },
            tradesAnalyzed: tradesSummary.length,
          }),
        },
      });
      insightId = insight.id;
    } else {
      console.warn('Prisma not available; skipping insight persistence');
    }

    return NextResponse.json({
      success: true,
      period: body.period,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      metrics: {
        totalTrades: trades.length,
        closedTrades: closedTrades.length,
        wins,
        losses,
        breakeven,
        winRate: parseFloat(winRate.toFixed(2)),
        totalPnL: parseFloat(totalPnL.toFixed(2)),
        avgWin: parseFloat(avgWin.toFixed(2)),
        avgLoss: parseFloat(avgLoss.toFixed(2)),
      },
      analysis,
      insightId,
    });
  } catch (error) {
    console.error('Error generating AI analysis:', error);

    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        return NextResponse.json(
          { error: 'OpenAI API key is invalid or not configured' },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to generate analysis. Please try again.' },
      { status: 500 }
    );
  }
}
