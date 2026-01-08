// Backtest simulation utility for testing strategies against historical data

interface Trade {
  entryPrice: number;
  exitPrice?: number;
  volume: number;
  direction: 'LONG' | 'SHORT';
  stopLoss?: number;
  takeProfit?: number;
}

interface BacktestResult {
  totalTrades: number;
  wins: number;
  losses: number;
  winRate: number;
  totalProfit: number;
  profitFactor: number;
  expectancy: number;
  maxDrawdown: number;
  riskRewardRatio: number;
}

export function simulateBacktest(trades: Trade[]): BacktestResult {
  if (trades.length === 0) {
    return {
      totalTrades: 0,
      wins: 0,
      losses: 0,
      winRate: 0,
      totalProfit: 0,
      profitFactor: 0,
      expectancy: 0,
      maxDrawdown: 0,
      riskRewardRatio: 0,
    };
  }

  let wins = 0;
  let losses = 0;
  let totalProfit = 0;
  let totalLoss = 0;
  let equity = 10000; // Starting equity
  let peakEquity = equity;
  let maxDrawdown = 0;

  for (const trade of trades) {
    if (!trade.exitPrice) continue;

    const pips = trade.direction === 'LONG' ? trade.exitPrice - trade.entryPrice : trade.entryPrice - trade.exitPrice;
    const tradeProfit = pips * trade.volume;

    if (tradeProfit > 0) {
      wins++;
      totalProfit += tradeProfit;
    } else {
      losses++;
      totalLoss += Math.abs(tradeProfit);
    }

    equity += tradeProfit;
    if (equity > peakEquity) {
      peakEquity = equity;
    }

    const drawdown = (peakEquity - equity) / peakEquity;
    if (drawdown > maxDrawdown) {
      maxDrawdown = drawdown;
    }
  }

  const totalTrades = wins + losses;
  const winRate = (wins / totalTrades) * 100;
  const profitFactor = totalLoss > 0 ? totalProfit / totalLoss : totalProfit > 0 ? Infinity : 0;
  const expectancy = (totalProfit - totalLoss) / totalTrades;
  const riskRewardRatio = totalLoss > 0 ? totalProfit / totalLoss : 0;

  return {
    totalTrades,
    wins,
    losses,
    winRate,
    totalProfit,
    profitFactor,
    expectancy,
    maxDrawdown,
    riskRewardRatio,
  };
}

export function calculateDrawdownPeriods(trades: Trade[]): { start: number; end: number; depth: number }[] {
  let equity = 10000;
  let peakEquity = equity;
  const drawdowns: { start: number; end: number; depth: number }[] = [];
  let drawdownStart = -1;

  for (let i = 0; i < trades.length; i++) {
    const trade = trades[i];
    if (!trade.exitPrice) continue;

    const pips = trade.direction === 'LONG' ? trade.exitPrice - trade.entryPrice : trade.entryPrice - trade.exitPrice;
    const tradeProfit = pips * trade.volume;

    equity += tradeProfit;

    if (equity > peakEquity) {
      if (drawdownStart !== -1) {
        drawdowns.push({
          start: drawdownStart,
          end: i - 1,
          depth: (peakEquity - equity) / peakEquity,
        });
        drawdownStart = -1;
      }
      peakEquity = equity;
    } else if (equity < peakEquity && drawdownStart === -1) {
      drawdownStart = i;
    }
  }

  return drawdowns;
}

export function optimizeStrategy(
  trades: Trade[],
  riskAdjustments: number[] = [0.5, 1.0, 1.5, 2.0]
): { risk: number; result: BacktestResult }[] {
  const results: { risk: number; result: BacktestResult }[] = [];

  for (const riskLevel of riskAdjustments) {
    const adjustedTrades = trades.map((trade) => ({
      ...trade,
      volume: trade.volume * riskLevel,
    }));

    const result = simulateBacktest(adjustedTrades);
    results.push({ risk: riskLevel, result });
  }

  return results;
}
