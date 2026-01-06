'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import StatCardV2 from '@/components/StatCardV2';
import { FiDollarSign, FiTrendingUp, FiTarget, FiRefreshCw } from 'react-icons/fi';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import toast, { Toaster } from 'react-hot-toast';

interface Trade {
  id: string;
  pair: string;
  direction: string;
  entryPrice: number;
  exitPrice?: number;
  profitLoss?: number;
  outcome?: string;
  emotionalState?: string;
  strategy?: string;
  account?: string;
  entryTime: string;
  setupQuality?: number;
}

export default function DashboardPage() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [metrics, setMetrics] = useState({
    totalPnL: 0,
    winRate: 0,
    totalTrades: 0,
    closedTrades: 0,
    avgWin: 0,
    avgLoss: 0,
    wins: 0,
    losses: 0,
    bestDay: 0,
    worstDay: 0,
  });

  const fetchTrades = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/trades', {
        headers: { 'x-user-id': 'demo-user' },
      });

      if (!response.ok) {
        // If the API returned an error, try to parse the body for details, but don't assume it's an array
        let errBody: any = null;
        try { errBody = await response.json(); } catch (e) { errBody = await response.text(); }
        console.error('Failed to fetch trades:', response.status, errBody);
        toast.error('Failed to fetch trades');
        setTrades([]);
        setMetrics({
          totalPnL: 0,
          winRate: 0,
          totalTrades: 0,
          closedTrades: 0,
          avgWin: 0,
          avgLoss: 0,
          wins: 0,
          losses: 0,
          bestDay: 0,
          worstDay: 0,
        });
        return;
      }

      const data: unknown = await response.json();
      if (!Array.isArray(data)) {
        console.warn('Unexpected trades payload, expected array but got:', data);
        toast.error('Unexpected trades format');
        setTrades([]);
        setMetrics({
          totalPnL: 0,
          winRate: 0,
          totalTrades: 0,
          closedTrades: 0,
          avgWin: 0,
          avgLoss: 0,
          wins: 0,
          losses: 0,
          bestDay: 0,
          worstDay: 0,
        });
        return;
      }

      const tradesData: Trade[] = data;
      setTrades(tradesData);

      // Calculate metrics
      const closed = tradesData.filter(t => t.outcome && t.outcome !== 'OPEN');
      const wins = closed.filter(t => t.outcome === 'WIN').length;
      const losses = closed.filter(t => t.outcome === 'LOSS').length;
      const totalPnL = tradesData.reduce((sum, t) => sum + (t.profitLoss || 0), 0);
      const avgWin = wins > 0 ? tradesData.filter(t => t.outcome === 'WIN' && t.profitLoss).reduce((sum, t) => sum + t.profitLoss!, 0) / wins : 0;
      const avgLoss = losses > 0 ? Math.abs(tradesData.filter(t => t.outcome === 'LOSS' && t.profitLoss).reduce((sum, t) => sum + t.profitLoss!, 0) / losses) : 0;

      setMetrics({
        totalPnL: parseFloat(totalPnL.toFixed(2)),
        winRate: closed.length > 0 ? parseFloat(((wins / closed.length) * 100).toFixed(2)) : 0,
        totalTrades: tradesData.length,
        closedTrades: closed.length,
        avgWin: parseFloat(avgWin.toFixed(2)),
        avgLoss: parseFloat(avgLoss.toFixed(2)),
        wins,
        losses,
        bestDay: totalPnL,
        worstDay: -totalPnL,
      });
    } catch (error) {
      console.error('Error fetching trades:', error);
      toast.error('Failed to fetch trades');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTrades();
  }, []);

  // Prepare chart data
  const equityCurveData = trades
    .sort((a, b) => new Date(a.entryTime).getTime() - new Date(b.entryTime).getTime())
    .reduce((acc, trade, idx) => {
      const equity = acc.length > 0 ? acc[acc.length - 1].equity + (trade.profitLoss || 0) : (trade.profitLoss || 0);
      return [...acc, {
        name: `Trade ${idx + 1}`,
        equity: parseFloat(equity.toFixed(2)),
        date: new Date(trade.entryTime).toLocaleDateString(),
      }];
    }, [] as any[]);

  const winDistribution = [
    { name: 'Wins', value: metrics.wins, color: 'var(--win-color)' },
    { name: 'Losses', value: metrics.losses, color: 'var(--loss-color)' },
  ];

  const pairPerformance = trades
    .reduce((acc, trade) => {
      const existing = acc.find(p => p.pair === trade.pair);
      if (existing) {
        existing.pnl += trade.profitLoss || 0;
      } else {
        acc.push({ pair: trade.pair, pnl: trade.profitLoss || 0 });
      }
      return acc;
    }, [] as { pair: string; pnl: number }[])
    .sort((a, b) => b.pnl - a.pnl)
    .slice(0, 5);

  return (
    <div style={{ width: '100%' }}>
      <Toaster position="bottom-right" />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          marginBottom: '32px',
        }}
      >
        <h2
          style={{
            fontSize: '28px',
            fontWeight: 'bold',
            margin: '0 0 8px 0',
            color: 'var(--foreground)',
          }}
        >
          Trading Dashboard
        </h2>
        <p
          style={{
            fontSize: '14px',
            color: 'var(--neutral-color)',
            margin: 0,
          }}
        >
          Your complete trading journal and performance analytics
        </p>
      </motion.div>

      {/* Refresh Button */}
      <div style={{ marginBottom: '24px' }}>
        <button
          onClick={fetchTrades}
          disabled={isLoading}
          style={{
            background: 'linear-gradient(135deg, var(--purple-base) 0%, var(--purple-dark) 100%)',
            color: 'white',
            padding: '10px 20px',
            borderRadius: '8px',
            border: 'none',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            fontWeight: '600',
            fontSize: '14px',
            transition: 'all 0.3s ease',
            opacity: isLoading ? 0.6 : 1,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <FiRefreshCw size={16} style={{ animation: isLoading ? 'spin 1s linear infinite' : 'none' }} />
          {isLoading ? 'Loading...' : 'Refresh Data'}
        </button>
      </div>

      {/* Key Metrics Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '16px',
          marginBottom: '32px',
        }}
      >
        <StatCardV2
          title="Total P&L"
          value={`$${metrics.totalPnL}`}
          color={metrics.totalPnL >= 0 ? 'green' : 'red'}
          subtitle={`${metrics.closedTrades} closed trades`}
          icon={<FiDollarSign size={24} />}
          trend={{
            value: 12.5,
            direction: metrics.totalPnL >= 0 ? 'up' : 'down',
          }}
        />

        <StatCardV2
          title="Win Rate"
          value={`${metrics.winRate}%`}
          color="blue"
          subtitle={`${metrics.wins}W / ${metrics.losses}L`}
          icon={<FiTrendingUp size={24} />}
        />

        <StatCardV2
          title="Avg Win / Loss"
          value={`$${metrics.avgWin} / $${metrics.avgLoss}`}
          color="purple"
          subtitle="Risk-Reward Ratio"
          icon={<FiTarget size={24} />}
        />

        <StatCardV2
          title="Total Trades"
          value={metrics.totalTrades}
          color="blue"
          subtitle={`${metrics.closedTrades} closed`}
        />
      </div>

      {/* Charts Section */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '2fr 360px',
          gap: '24px',
          marginBottom: '32px',
        }}
      >
        {/* Equity Curve (Main) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{
            backgroundColor: 'var(--card-bg)',
            border: '1px solid var(--card-border)',
            borderRadius: 'var(--radius-lg)',
            padding: '20px',
            minHeight: '360px',
          }}
        >
          <h3
            style={{
              fontSize: '16px',
              fontWeight: '700',
              marginBottom: '16px',
              color: 'var(--foreground)',
            }}
          >
            Equity Curve
          </h3>
          {equityCurveData.length > 0 ? (
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={equityCurveData}>
                <defs>
                  <linearGradient id="colorEquity" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--purple-base)" stopOpacity={0.9} />
                    <stop offset="95%" stopColor="var(--purple-base)" stopOpacity={0.08} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--card-border)" />
                <XAxis dataKey="name" stroke="var(--neutral-color)" />
                <YAxis stroke="var(--neutral-color)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--card-bg)',
                    border: `1px solid var(--card-border)`,
                    borderRadius: '8px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="equity"
                  stroke="var(--purple-light)"
                  fillOpacity={1}
                  fill="url(#colorEquity)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div
              style={{
                height: '300px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--neutral-color)',
              }}
            >
              No trades to display
            </div>
          )}
        </motion.div>

        {/* Right Column: compact cards */}
        <div style={{display: 'flex', flexDirection: 'column', gap: '18px'}}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            style={{
              backgroundColor: 'var(--card-bg)',
              border: '1px solid var(--card-border)',
              borderRadius: 'var(--radius-md)',
              padding: '16px',
              minHeight: '180px',
            }}
          >
            <h3
              style={{
                fontSize: '14px',
                fontWeight: '700',
                marginBottom: '12px',
                color: 'var(--foreground)',
              }}
            >
              Win Distribution
            </h3>
            {winDistribution.some(w => w.value > 0) ? (
              <ResponsiveContainer width="100%" height={140}>
                <PieChart>
                  <Pie
                    data={winDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name}: ${entry.value}`}
                    outerRadius={60}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {winDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div
                style={{
                  height: '140px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--neutral-color)',
                }}
              >
                No closed trades yet
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            style={{
              backgroundColor: 'var(--card-bg)',
              border: '1px solid var(--card-border)',
              borderRadius: 'var(--radius-md)',
              padding: '16px',
              minHeight: '200px',
            }}
          >
            <h3
              style={{
                fontSize: '14px',
                fontWeight: '700',
                marginBottom: '12px',
                color: 'var(--foreground)',
              }}
            >
              Top Pairs
            </h3>
            {pairPerformance.length > 0 ? (
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={pairPerformance}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--card-border)" />
                  <XAxis dataKey="pair" stroke="var(--neutral-color)" />
                  <YAxis stroke="var(--neutral-color)" />
                  <Bar
                    dataKey="pnl"
                    fill="var(--purple-light)"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div
                style={{
                  height: '160px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--neutral-color)',
                }}
              >
                No trade data yet
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '32px',
        }}
      >
        <div
          style={{
            backgroundColor: 'var(--card-bg)',
            border: '1px solid var(--card-border)',
            borderRadius: '12px',
            padding: '16px',
            textAlign: 'center',
          }}
        >
          <p style={{ color: 'var(--neutral-color)', margin: '0 0 8px 0', fontSize: '12px' }}>
            Consecutive Wins
          </p>
          <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, color: 'var(--win-color)' }}>
            0
          </p>
        </div>

        <div
          style={{
            backgroundColor: 'var(--card-bg)',
            border: '1px solid var(--card-border)',
            borderRadius: '12px',
            padding: '16px',
            textAlign: 'center',
          }}
        >
          <p style={{ color: 'var(--neutral-color)', margin: '0 0 8px 0', fontSize: '12px' }}>
            Best Day
          </p>
          <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, color: 'var(--win-color)' }}>
            ${metrics.bestDay}
          </p>
        </div>

        <div
          style={{
            backgroundColor: 'var(--card-bg)',
            border: '1px solid var(--card-border)',
            borderRadius: '12px',
            padding: '16px',
            textAlign: 'center',
          }}
        >
          <p style={{ color: 'var(--neutral-color)', margin: '0 0 8px 0', fontSize: '12px' }}>
            Worst Day
          </p>
          <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, color: 'var(--loss-color)' }}>
            ${metrics.worstDay}
          </p>
        </div>
      </motion.div>
    </div>
  );
}
