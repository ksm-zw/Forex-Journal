'use client';

import { useState, useEffect } from 'react';
import DashboardHeaderV3 from '@/components/DashboardHeaderV3';
import VoiceRecorder from '@/components/VoiceRecorder';
import ScreenshotUploader from '@/components/ScreenshotUploader';
import { useTheme } from '@/context/ThemeContext';
import { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast';
import AnimatedCard from '@/components/AnimatedCard';

export default function TradeReviewPage() {
  // useTheme retained for potential theme-dependent content, header uses v3
  const [mounted, setMounted] = useState(false);
  const [selectedTradeId, setSelectedTradeId] = useState<string | null>(null);
  const [trades, setTrades] = useState<any[]>([]);
  const [reviewData, setReviewData] = useState({
    whatLearned: '',
    mistakes: [] as string[],
    emotionalState: 'calm',
    setupQuality: 3,
  });
  const [currentMistake, setCurrentMistake] = useState('');

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
          console.warn('Unexpected trades payload in review page', data);
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

  const selectedTrade = trades.find(t => t.id === selectedTradeId);

  const mistakeOptions = [
    'Overtraded',
    'Broke rules',
    'Wrong entry point',
    'Hesitated on trade',
    'Exited too early',
    'Exited too late',
    'Ignored analysis',
    'Bad position sizing',
    'Emotion-driven',
  ];

  const toggleMistake = (mistake: string) => {
    setReviewData(prev => ({
      ...prev,
      mistakes: prev.mistakes.includes(mistake)
        ? prev.mistakes.filter(m => m !== mistake)
        : [...prev.mistakes, mistake],
    }));
  };

  const saveReview = async () => {
    if (!selectedTrade) return;

    try {
      const response = await fetch(`/api/trades/${selectedTrade.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': 'demo-user',
        },
        body: JSON.stringify({
          whatLearned: reviewData.whatLearned,
          mistakes: JSON.stringify(reviewData.mistakes),
          emotionalState: reviewData.emotionalState,
          setupQuality: reviewData.setupQuality,
        }),
      });

      if (response.ok) {
        toast.success('Review saved');
        setSelectedTradeId(null);
      }
    } catch (error) {
      toast.error('Failed to save review');
    }
  };

  if (!mounted) {
    return <div className="min-h-screen bg-white dark:bg-slate-950" />;
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <DashboardHeaderV3 />

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Trade Reviews</h1>
          <p className="text-gray-600 dark:text-gray-400">Deep dive into your trades and learn from them</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Trades List */}
          <AnimatedCard className="bg-white dark:bg-slate-800 p-4 border border-gray-200 dark:border-slate-700">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Recent Trades</h2>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {trades.length > 0 ? (
                trades.map(trade => (
                  <button
                    key={trade.id}
                    onClick={() => {
                      setSelectedTradeId(trade.id);
                      setReviewData({
                        whatLearned: trade.whatLearned || '',
                        mistakes: trade.mistakes ? JSON.parse(trade.mistakes) : [],
                        emotionalState: trade.emotionalState || 'calm',
                        setupQuality: trade.setupQuality || 3,
                      });
                    }}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      selectedTradeId === trade.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-slate-600'
                    }`}
                  >
                    <div className="font-semibold text-sm">{trade.pair}</div>
                    <div className="text-xs opacity-75">
                      {new Date(trade.entryTime).toLocaleDateString()}
                    </div>
                  </button>
                ))
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                  No trades yet
                </p>
              )}
            </div>
            </AnimatedCard>

          {/* Review Form */}
          {selectedTrade ? (
            <div className="lg:col-span-2 space-y-6">
              {/* Trade Summary */}
              <AnimatedCard className="bg-white dark:bg-slate-800 p-4 border border-gray-200 dark:border-slate-700">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                  {selectedTrade.pair} - {selectedTrade.direction}
                </h2>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">Entry</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {selectedTrade.entryPrice.toFixed(5)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">Exit</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {selectedTrade.exitPrice?.toFixed(5) || 'Open'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">P&L</p>
                    <p className={`font-semibold ${selectedTrade.profitLoss >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {selectedTrade.profitLoss?.toFixed(2) || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">Outcome</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {selectedTrade.outcome || 'Open'}
                    </p>
                  </div>
                </div>
              </AnimatedCard>

              {/* Review Fields */}
              <AnimatedCard className="bg-white dark:bg-slate-800 p-4 border border-gray-200 dark:border-slate-700">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Review Details</h3>

                {/* What I Learned */}
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    What I Learned
                  </label>
                  <textarea
                    value={reviewData.whatLearned}
                    onChange={(e) =>
                      setReviewData(prev => ({ ...prev, whatLearned: e.target.value }))
                    }
                    placeholder="What did this trade teach you?"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none h-20"
                  />
                </div>

                {/* Emotional State */}
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Emotional State
                  </label>
                  <select
                    value={reviewData.emotionalState}
                    onChange={(e) =>
                      setReviewData(prev => ({ ...prev, emotionalState: e.target.value }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option>calm</option>
                    <option>rushed</option>
                    <option>frustrated</option>
                    <option>confident</option>
                    <option>fearful</option>
                  </select>
                </div>

                {/* Setup Quality */}
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Setup Quality Rating
                  </label>
                  <select
                    value={reviewData.setupQuality}
                    onChange={(e) =>
                      setReviewData(prev => ({ ...prev, setupQuality: parseInt(e.target.value) }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="1">⭐ Poor</option>
                    <option value="2">⭐⭐ Below Average</option>
                    <option value="3">⭐⭐⭐ Average</option>
                    <option value="4">⭐⭐⭐⭐ Good</option>
                    <option value="5">⭐⭐⭐⭐⭐ Excellent</option>
                  </select>
                </div>

                {/* Mistakes */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Mistakes Made
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {mistakeOptions.map(mistake => (
                      <label key={mistake} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={reviewData.mistakes.includes(mistake)}
                          onChange={() => toggleMistake(mistake)}
                          className="w-4 h-4 rounded border-gray-300 dark:border-slate-600"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{mistake}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </AnimatedCard>

              <button
                onClick={saveReview}
                className="w-full btn-primary disabled:opacity-50 transition-colors text-center"
              >
                Save Review
              </button>
            </div>
          ) : (
            <AnimatedCard className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 text-center border border-gray-200 dark:border-slate-700">
              <p className="text-gray-600 dark:text-gray-400">Select a trade to review</p>
            </AnimatedCard>
          )}
        </div>

        {/* Media Uploads */}
        {selectedTrade && (
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
            <AnimatedCard className="p-6"><VoiceRecorder /></AnimatedCard>
            <AnimatedCard className="p-6"><ScreenshotUploader /></AnimatedCard>
          </div>
        )}
      </main>

      <Toaster position="bottom-right" />
    </div>
  );
}
