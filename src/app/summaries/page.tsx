'use client';

import { useEffect, useState } from 'react';
import DashboardHeaderV3 from '@/components/DashboardHeaderV3';
import StatCardV2 from '@/components/StatCardV2';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

interface Summary {
  id: string;
  period_type: string;
  start_date: string;
  end_date: string;
  content: string;
  feedback_actions: any;
  created_at?: string;
}

export default function SummariesPage() {
  const [summaries, setSummaries] = useState<Summary[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSummary, setSelectedSummary] = useState<Summary | null>(null);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchSummaries();
  }, []);

  async function fetchSummaries() {
    try {
      const response = await fetch('/api/summaries', {
        headers: { 'x-user-id': 'demo@forex-research.com' },
      });
      const data = await response.json();
      if (data.success) {
        setSummaries(data.summaries || []);
      }
    } catch (error) {
      console.error('Failed to fetch summaries:', error);
    } finally {
      setLoading(false);
    }
  }

  async function generateNewSummary() {
    setGenerating(true);
    try {
      const response = await fetch('/api/summaries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': 'demo@forex-research.com',
        },
        body: JSON.stringify({
          period_type: 'monthly',
          start_date: new Date(new Date().setDate(1)).toISOString().split('T')[0],
          end_date: new Date().toISOString().split('T')[0],
        }),
      });
      const data = await response.json();
      if (data.success) {
        fetchSummaries();
      }
    } catch (error) {
      console.error('Failed to generate summary:', error);
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0f0e1d] text-white">
      <DashboardHeaderV3 />

      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Trading Summaries</h1>
              <p className="text-gray-400">AI-generated insights and analysis of your trading periods</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={generateNewSummary}
              disabled={generating}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-500 rounded-lg font-semibold disabled:opacity-50 hover:shadow-lg hover:shadow-purple-500/50 transition-all"
            >
              {generating ? 'Generating...' : '+ Generate Summary'}
            </motion.button>
          </div>
        </motion.div>

        {loading ? (
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full" />
          </div>
        ) : summaries.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="text-6xl mb-4">📊</div>
            <p className="text-gray-400 mb-6">No summaries yet. Generate one to get started!</p>
            <button
              onClick={generateNewSummary}
              className="px-6 py-2 bg-purple-600 rounded-lg font-semibold hover:bg-purple-500 transition-colors"
            >
              Create First Summary
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Summaries List */}
            <div className="lg:col-span-1">
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {summaries.map((summary, idx) => (
                  <motion.button
                    key={summary.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    onClick={() => setSelectedSummary(summary)}
                    className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                      selectedSummary?.id === summary.id
                        ? 'border-purple-500 bg-purple-900/20'
                        : 'border-gray-700 hover:border-purple-500/50 bg-gray-800/30'
                    }`}
                  >
                    <div className="font-semibold capitalize">{summary.period_type}</div>
                    <div className="text-sm text-gray-400">
                      {format(new Date(summary.start_date), 'MMM d')} -{' '}
                      {format(new Date(summary.end_date), 'MMM d')}
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Summary Details */}
            <div className="lg:col-span-2">
              {selectedSummary ? (
                <motion.div
                  key={selectedSummary.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-gradient-to-br from-gray-900 to-gray-800/50 rounded-xl border border-gray-700 p-8"
                >
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold capitalize mb-2">{selectedSummary.period_type} Summary</h2>
                    <p className="text-gray-400">
                      {format(new Date(selectedSummary.start_date), 'MMMM d, yyyy')} to{' '}
                      {format(new Date(selectedSummary.end_date), 'MMMM d, yyyy')}
                    </p>
                  </div>

                  {/* Content */}
                  <div className="bg-gray-800/50 rounded-lg p-6 mb-6">
                    <p className="text-gray-200 whitespace-pre-wrap leading-relaxed">
                      {selectedSummary.content}
                    </p>
                  </div>

                  {/* Feedback Actions */}
                  {selectedSummary.feedback_actions && 
                    selectedSummary.feedback_actions.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="font-semibold text-lg">Recommended Actions</h3>
                      {selectedSummary.feedback_actions.map(
                        (
                          action: { action: string; reason: string },
                          idx: number
                        ) => (
                          <div
                            key={idx}
                            className="flex items-start gap-3 p-3 bg-gray-800/50 rounded-lg"
                          >
                            <div
                              className={`text-xl flex-shrink-0 ${
                                action.action === 'CONTINUE'
                                  ? '✅'
                                  : action.action === 'EXPERIMENT'
                                    ? '🔬'
                                    : '⛔'
                              }`}
                            />
                            <div>
                              <div className="font-semibold text-sm uppercase tracking-wider">
                                {action.action}
                              </div>
                              <p className="text-gray-300 text-sm">{action.reason}</p>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  )}
                </motion.div>
              ) : (
                <div className="flex items-center justify-center h-96 bg-gradient-to-br from-gray-900 to-gray-800/50 rounded-xl border border-gray-700">
                  <p className="text-gray-400">Select a summary to view details</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
