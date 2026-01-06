'use client';

import { useState, useEffect, useMemo } from 'react';
import DashboardHeader from '@/components/DashboardHeader';
import { useTheme } from '@/context/ThemeContext';
import { Toaster } from 'react-hot-toast';
import { FiTrendingUp, FiAlertCircle, FiTarget, FiZap } from 'react-icons/fi';

interface Trade {
  id: string;
  pair: string;
  direction: string;
  entryTime: string;
  outcome?: string;
  profitLoss?: number;
  emotionalState?: string;
  strategy?: string;
  mistakes?: string;
  setupQuality?: number;
}

interface Insight {
  type: 'pattern' | 'improvement' | 'strength' | 'warning';
  title: string;
  description: string;
  icon: typeof FiTrendingUp;
  color: string;
}

export default function InsightsPage() {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [insights, setInsights] = useState<Insight[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const fetchTrades = async () => {
      try {
        const response = await fetch('/api/trades', {
          headers: {
            'x-user-id': 'demo-user',
          },
        });

        if (!response.ok) {
          let errBody: any = null;
          try { errBody = await response.json(); } catch (e) { errBody = await response.text(); }
          console.error('Failed to fetch trades:', response.status, errBody);
          setTrades([]);
          return;
        }

        const data = await response.json();
        if (!Array.isArray(data)) {
          console.warn('Unexpected trades payload in insights page', data);
          setTrades([]);
          return;
        }

        setTrades(data);
      } catch (error) {
        console.error('Error fetching trades:', error);
      }
    };

    fetchTrades();
  }, [mounted]);

  // Generate AI insights
  useEffect(() => {
    if (trades.length === 0) return;

    const generatedInsights: Insight[] = [];

    // Best performing pairs
    const pairStats: { [key: string]: { wins: number; losses: number; pnl: number } } = {};
    trades.forEach(trade => {
      if (!pairStats[trade.pair]) {
        pairStats[trade.pair] = { wins: 0, losses: 0, pnl: 0 };
      }
      if (trade.outcome === 'WIN') pairStats[trade.pair].wins++;
      if (trade.outcome === 'LOSS') pairStats[trade.pair].losses++;
      pairStats[trade.pair].pnl += trade.profitLoss || 0;
    });

    const bestPair = Object.entries(pairStats).sort((a, b) => b[1].wins - a[1].wins)[0];
    if (bestPair) {
      generatedInsights.push({
        type: 'strength',
        title: `${bestPair[0]} is your best pair`,
        description: `You have a ${Math.round((bestPair[1].wins / (bestPair[1].wins + bestPair[1].losses)) * 100)}% win rate on ${bestPair[0]}. Consider trading it more often.`,
        icon: FiTrendingUp,
        color: 'text-green-600 dark:text-green-400',
      });
    }

    // Emotional state analysis
    const emotionalTrades = trades.filter(t => t.emotionalState);
    if (emotionalTrades.length > 0) {
      const emotionalStats: { [key: string]: { wins: number; losses: number } } = {};
      emotionalTrades.forEach(trade => {
        if (!emotionalStats[trade.emotionalState || '']) {
          emotionalStats[trade.emotionalState || ''] = { wins: 0, losses: 0 };
        }
        if (trade.outcome === 'WIN') emotionalStats[trade.emotionalState || ''].wins++;
        else emotionalStats[trade.emotionalState || ''].losses++;
      });

      const bestState = Object.entries(emotionalStats).sort((a, b) => b[1].wins - a[1].wins)[0];
      if (bestState) {
        generatedInsights.push({
          type: 'pattern',
          title: `You trade best when ${bestState[0]}`,
          description: `${bestState[1].wins} wins when ${bestState[0]} vs ${bestState[1].losses} losses. Remember this state for future trades.`,
          icon: FiZap,
          color: 'text-blue-600 dark:text-blue-400',
        });
      }
    }

    // Win rate by direction
    const longs = trades.filter(t => t.direction === 'LONG');
    const shorts = trades.filter(t => t.direction === 'SHORT');
    const longWinRate = longs.length > 0 ? (longs.filter(t => t.outcome === 'WIN').length / longs.length) * 100 : 0;
    const shortWinRate = shorts.length > 0 ? (shorts.filter(t => t.outcome === 'WIN').length / shorts.length) * 100 : 0;

    if (longWinRate > shortWinRate && longWinRate > 40) {
      generatedInsights.push({
        type: 'improvement',
        title: 'You are better at LONG trades',
        description: `Long win rate: ${Math.round(longWinRate)}% vs Short: ${Math.round(shortWinRate)}%. Focus more on long setups.`,
        icon: FiTarget,
        color: 'text-green-600 dark:text-green-400',
      });
    }

    // Common mistakes warning
    const allMistakes = trades
      .filter(t => t.mistakes)
      .flatMap(t => {
        try {
          return t.mistakes ? JSON.parse(t.mistakes) : [];
        } catch {
          return [];
        }
      });

    if (allMistakes.length > 0) {
      const mistakeCount: { [key: string]: number } = {};
      allMistakes.forEach(m => {
        mistakeCount[m] = (mistakeCount[m] || 0) + 1;
      });

      const topMistake = Object.entries(mistakeCount).sort((a, b) => b[1] - a[1])[0];
      if (topMistake && topMistake[1] > 1) {
        generatedInsights.push({
          type: 'warning',
          title: `Repeated mistake: ${topMistake[0]}`,
          description: `You've made this mistake ${topMistake[1]} times. Create a checklist to prevent this.`,
          icon: FiAlertCircle,
          color: 'text-orange-600 dark:text-orange-400',
        });
      }
    }

    // Time-based analysis
    const morningTrades = trades.filter(t => {
      const hour = new Date(t.entryTime).getHours();
      return hour >= 8 && hour < 12;
    });

    if (morningTrades.length > 5) {
      const morningWins = morningTrades.filter(t => t.outcome === 'WIN').length;
      const morningWinRate = (morningWins / morningTrades.length) * 100;
      if (morningWinRate > 60) {
        generatedInsights.push({
          type: 'pattern',
          title: 'You trade best in the morning',
          description: `Morning (8am-12pm) win rate: ${Math.round(morningWinRate)}%. Schedule more trades during this time.`,
          icon: FiTrendingUp,
          color: 'text-yellow-600 dark:text-yellow-400',
        });
      }
    }

    setInsights(generatedInsights);
  }, [trades]);

  if (!mounted) {
    return <div className="min-h-screen bg-white dark:bg-slate-950" />;
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <DashboardHeader onThemeToggle={toggleTheme} currentTheme={theme} />

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">AI-Powered Insights</h1>
          <p className="text-gray-600 dark:text-gray-400">Get personalized trading improvements based on your data</p>
        </div>

        {insights.length > 0 ? (
          <div className="space-y-4">
            {insights.map((insight, idx) => {
              const Icon = insight.icon;
              const bgColor = insight.type === 'warning'
                ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-700'
                : insight.type === 'strength'
                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700'
                : insight.type === 'improvement'
                ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700'
                : 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-700';

              return (
                <div key={idx} className={`${bgColor} border rounded-lg p-6`}>
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-lg ${insight.color} bg-white dark:bg-slate-800`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                        {insight.title}
                      </h3>
                      <p className="text-gray-700 dark:text-gray-300">
                        {insight.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-800 rounded-lg p-12 text-center border border-gray-200 dark:border-slate-700">
            <p className="text-gray-600 dark:text-gray-400 mb-2">Add more trades to get AI-powered insights</p>
            <p className="text-sm text-gray-500 dark:text-gray-500">The more data you have, the better insights we can provide</p>
          </div>
        )}

        {/* Weekly Summary */}
        {trades.length > 0 && (
          <div className="mt-8 bg-white dark:bg-slate-800 rounded-lg p-6 border border-gray-200 dark:border-slate-700">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">This Week's Summary</h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-50 dark:bg-slate-700 p-4 rounded-lg">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Total Trades</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{trades.length}</p>
              </div>
              <div className="bg-gray-50 dark:bg-slate-700 p-4 rounded-lg">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Win Rate</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {trades.length > 0
                    ? Math.round(
                        ((trades.filter(t => t.outcome === 'WIN').length / trades.length) * 100)
                      )
                    : 0}%
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-slate-700 p-4 rounded-lg">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Total P&L</p>
                <p className={`text-2xl font-bold ${
                  trades.reduce((sum, t) => sum + (t.profitLoss || 0), 0) >= 0
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  {(trades.reduce((sum, t) => sum + (t.profitLoss || 0), 0) || 0).toFixed(2)}
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-slate-700 p-4 rounded-lg">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Avg Quality</p>
                <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {trades.filter(t => t.setupQuality).length > 0
                    ? (
                        trades
                          .filter(t => t.setupQuality)
                          .reduce((sum, t) => sum + (t.setupQuality || 0), 0) /
                        trades.filter(t => t.setupQuality).length
                      ).toFixed(1)
                    : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      <Toaster position="bottom-right" />
    </div>
  );
}
