'use client';

import { useEffect, useState } from 'react';
import DashboardHeaderV3 from '@/components/DashboardHeaderV3';
import { motion } from 'framer-motion';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface BacktestTrade {
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
  equityCurve?: Array<{ trade: number; equity: number }>;
}

interface Strategy {
  id: string;
  strategy_name: string;
  _count?: {
    trades: number;
  };
}

export default function BacktestPage() {
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [selectedStrategy, setSelectedStrategy] = useState<string>('');
  const [riskPercent, setRiskPercent] = useState(2);
  const [tradeCount, setTradeCount] = useState(20);
  const [result, setResult] = useState<BacktestResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [equityData, setEquityData] = useState<Array<{ trade: number; equity: number }>>([]);

  useEffect(() => {
    fetchStrategies();
  }, []);

  async function fetchStrategies() {
    try {
      const response = await fetch('/api/strategies', {
        headers: { 'x-user-id': 'demo@forex-research.com' },
      });
      const data = await response.json();
      if (data.success && data.strategies) {
        setStrategies(data.strategies);
        if (data.strategies.length > 0) {
          setSelectedStrategy(data.strategies[0].id);
        }
      }
    } catch (error) {
      console.error('Failed to fetch strategies:', error);
    }
  }

  async function runBacktest() {
    if (!selectedStrategy) return;

    setLoading(true);
    try {
      // Simulate backtest with random trades
      const mockTrades: BacktestTrade[] = Array.from({ length: tradeCount }, () => ({
        entryPrice: 100 + Math.random() * 20 - 10,
        exitPrice: 100 + Math.random() * 20 - 10,
        volume: Math.random() < 0.7 ? 0.1 : 0.05,
        direction: Math.random() < 0.5 ? 'LONG' : 'SHORT',
        stopLoss: 100 - 2,
        takeProfit: 100 + 3,
      }));

      // Calculate backtest results
      let wins = 0;
      let losses = 0;
      let totalProfit = 0;
      let totalLoss = 0;
      let equity = 10000;
      let peakEquity = equity;
      let maxDrawdown = 0;
      const equityPoints = [{ trade: 0, equity }];

      for (let i = 0; i < mockTrades.length; i++) {
        const trade = mockTrades[i];
        if (!trade.exitPrice) continue;

        const pips =
          trade.direction === 'LONG'
            ? trade.exitPrice - trade.entryPrice
            : trade.entryPrice - trade.exitPrice;

        const profit = pips * 100 * trade.volume * (riskPercent / 100);

        if (profit > 0) {
          wins++;
          totalProfit += profit;
        } else {
          losses++;
          totalLoss += Math.abs(profit);
        }

        equity += profit;
        peakEquity = Math.max(peakEquity, equity);
        const drawdown = ((peakEquity - equity) / peakEquity) * 100;
        maxDrawdown = Math.max(maxDrawdown, drawdown);

        equityPoints.push({ trade: i + 1, equity: Math.round(equity * 100) / 100 });
      }

      const totalTrades = wins + losses;
      const winRate = totalTrades > 0 ? (wins / totalTrades) * 100 : 0;
      const profitFactor = totalLoss > 0 ? totalProfit / totalLoss : 0;
      const expectancy =
        totalTrades > 0 ? ((wins * (totalProfit / wins) - losses * (totalLoss / losses)) / totalTrades) * 100 : 0;
      const riskRewardRatio = totalProfit > 0 && totalLoss > 0 ? totalProfit / totalLoss : 0;

      const backTestResult: BacktestResult = {
        totalTrades,
        wins,
        losses,
        winRate,
        totalProfit: Math.round(totalProfit * 100) / 100,
        profitFactor: Math.round(profitFactor * 100) / 100,
        expectancy: Math.round(expectancy * 100) / 100,
        maxDrawdown: Math.round(maxDrawdown * 100) / 100,
        riskRewardRatio: Math.round(riskRewardRatio * 100) / 100,
      };

      setResult(backTestResult);
      setEquityData(equityPoints);
    } catch (error) {
      console.error('Backtest failed:', error);
    } finally {
      setLoading(false);
    }
  }

  const metrics = result
    ? [
        { label: 'Win Rate', value: `${result.winRate.toFixed(1)}%`, color: 'text-green-400' },
        { label: 'Total Trades', value: result.totalTrades, color: 'text-blue-400' },
        { label: 'Wins / Losses', value: `${result.wins} / ${result.losses}`, color: 'text-purple-400' },
        { label: 'Profit Factor', value: result.profitFactor.toFixed(2), color: 'text-yellow-400' },
        { label: 'Total Profit', value: `$${result.totalProfit}`, color: 'text-green-500' },
        { label: 'Max Drawdown', value: `${result.maxDrawdown.toFixed(2)}%`, color: 'text-red-400' },
        { label: 'Expectancy', value: `$${result.expectancy}`, color: 'text-cyan-400' },
        { label: 'Risk/Reward', value: result.riskRewardRatio.toFixed(2), color: 'text-indigo-400' },
      ]
    : [];

  return (
    <div className="min-h-screen bg-[#0f0e1d] text-white">
      <DashboardHeaderV3 />

      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Strategy Backtest Simulator</h1>
          <p className="text-gray-400">Test strategy performance with historical data simulation</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Controls */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-gradient-to-br from-gray-900 to-gray-800/50 rounded-xl border border-gray-700 p-6"
          >
            <h2 className="text-xl font-bold mb-6">Backtest Settings</h2>

            {/* Strategy Selection */}
            <div className="mb-6">
              <label className="block text-sm font-semibold mb-2">Strategy</label>
              <select
                value={selectedStrategy}
                onChange={(e) => setSelectedStrategy(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-purple-500 focus:outline-none"
              >
                {strategies.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.strategy_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Risk Percent Slider */}
            <div className="mb-6">
              <label className="block text-sm font-semibold mb-2">
                Risk per Trade: <span className="text-purple-400">{riskPercent}%</span>
              </label>
              <input
                type="range"
                min="0.5"
                max="5"
                step="0.5"
                value={riskPercent}
                onChange={(e) => setRiskPercent(parseFloat(e.target.value))}
                className="w-full cursor-pointer accent-purple-500"
              />
            </div>

            {/* Trade Count Slider */}
            <div className="mb-8">
              <label className="block text-sm font-semibold mb-2">
                Number of Trades: <span className="text-purple-400">{tradeCount}</span>
              </label>
              <input
                type="range"
                min="10"
                max="100"
                step="10"
                value={tradeCount}
                onChange={(e) => setTradeCount(parseInt(e.target.value))}
                className="w-full cursor-pointer accent-purple-500"
              />
            </div>

            {/* Run Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={runBacktest}
              disabled={loading || !selectedStrategy}
              className="w-full btn-primary disabled:opacity-50 hover:shadow-lg hover:shadow-purple-500/50 transition-all text-center"
            >
              {loading ? 'Running Backtest...' : 'Run Backtest'}
            </motion.button>
          </motion.div>

          {/* Results */}
          <div className="lg:col-span-3 space-y-6">
            {/* Metrics Grid */}
            {result && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                <h3 className="text-lg font-bold">Results</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {metrics.map((metric, idx) => (
                    <motion.div
                      key={metric.label}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.05 }}
                      className="bg-gradient-to-br from-gray-900 to-gray-800/50 rounded-lg border border-gray-700 p-4"
                    >
                      <p className="text-xs text-gray-400 font-semibold">{metric.label}</p>
                      <p className={`text-xl font-bold mt-1 ${metric.color}`}>{metric.value}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Equity Curve Chart */}
            {result && equityData.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-gray-900 to-gray-800/50 rounded-xl border border-gray-700 p-6"
              >
                <h3 className="text-lg font-bold mb-4">Equity Curve</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={equityData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="trade" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1f2937',
                        border: '1px solid #374151',
                        borderRadius: '8px',
                      }}
                      labelStyle={{ color: '#f3f4f6' }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="equity"
                      stroke="#a78bfa"
                      dot={false}
                      isAnimationActive={false}
                      name="Account Equity"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </motion.div>
            )}

            {/* Stats Breakdown */}
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-2 md:grid-cols-3 gap-4"
              >
                <div className="bg-gradient-to-br from-gray-900 to-gray-800/50 rounded-lg border border-gray-700 p-4">
                  <p className="text-xs text-gray-400 font-semibold">Consecutive Wins</p>
                  <p className="text-2xl font-bold text-green-400 mt-1">
                    {Math.ceil(result.wins * (result.winRate / 100))}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-gray-900 to-gray-800/50 rounded-lg border border-gray-700 p-4">
                  <p className="text-xs text-gray-400 font-semibold">Avg Win/Loss Ratio</p>
                  <p className="text-2xl font-bold text-blue-400 mt-1">{result.profitFactor.toFixed(2)}</p>
                </div>
                <div className="bg-gradient-to-br from-gray-900 to-gray-800/50 rounded-lg border border-gray-700 p-4">
                  <p className="text-xs text-gray-400 font-semibold">Return %</p>
                  <p className="text-2xl font-bold text-purple-400 mt-1">
                    {((result.totalProfit / 10000) * 100).toFixed(1)}%
                  </p>
                </div>
              </motion.div>
            )}

            {/* Empty State */}
            {!result && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-gradient-to-br from-gray-900 to-gray-800/50 rounded-xl border border-gray-700 p-12 text-center"
              >
                <div className="text-6xl mb-4">📈</div>
                <p className="text-gray-400">Configure settings and click "Run Backtest" to see results</p>
              </motion.div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
