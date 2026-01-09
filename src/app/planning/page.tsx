'use client';

import { useState, useEffect } from 'react';
import DashboardHeaderV3 from '@/components/DashboardHeaderV3';
import { useTheme } from '@/context/ThemeContext';
import toast from 'react-hot-toast';
import { Toaster } from 'react-hot-toast';
import { FiPlus, FiX } from 'react-icons/fi';
import AnimatedCard from '@/components/AnimatedCard';

interface DailyGoal {
  date: string;
  goals: string[];
  notes: string;
}

export default function PlanningPage() {
  // header v3 used across app
  const [mounted, setMounted] = useState(false);
  const [today] = useState(new Date().toISOString().split('T')[0]);
  const [dailyGoal, setDailyGoal] = useState<DailyGoal>({
    date: today,
    goals: [],
    notes: '',
  });
  const [currentGoal, setCurrentGoal] = useState('');
  const [weeklyFocus, setWeeklyFocus] = useState('');
  const [preMarketNotes, setPreMarketNotes] = useState('');
  const [postSessionNotes, setPostSessionNotes] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  const addGoal = () => {
    if (!currentGoal.trim()) return;
    setDailyGoal(prev => ({
      ...prev,
      goals: [...prev.goals, currentGoal],
    }));
    setCurrentGoal('');
  };

  const removeGoal = (index: number) => {
    setDailyGoal(prev => ({
      ...prev,
      goals: prev.goals.filter((_, i) => i !== index),
    }));
  };

  const saveGoals = async () => {
    try {
      // In a real app, this would save to the database
      toast.success('Daily goals saved!');
    } catch (error) {
      toast.error('Failed to save goals');
    }
  };

  if (!mounted) {
    return <div className="min-h-screen bg-white dark:bg-slate-950" />;
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <DashboardHeaderV3 />

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Trading Plan & Goals</h1>
          <p className="text-gray-600 dark:text-gray-400">Plan your trading day and track your progress</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Daily Goals Section */}
          <AnimatedCard className="p-6 card">
            <h2 className="text-lg font-bold gradient-text mb-4">Today's Goals</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">{today}</p>

            {/* Add Goal */}
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={currentGoal}
                onChange={(e) => setCurrentGoal(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addGoal()}
                placeholder="Add a trading goal (e.g., 'Stick to 5 trades max')"
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <button
                onClick={addGoal}
                className="btn-compact btn-primary"
              >
                <FiPlus className="w-5 h-5" />
              </button>
            </div>

            {/* Goals List */}
            <div className="space-y-2 mb-6">
              {dailyGoal.goals.map((goal, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between bg-gray-50 dark:bg-slate-700 p-3 rounded-lg"
                >
                  <span className="text-sm text-gray-900 dark:text-white">{goal}</span>
                  <button
                    onClick={() => removeGoal(idx)}
                    className="text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 p-1 rounded"
                  >
                    <FiX className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Notes */}
            <div className="mb-4">
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Notes
              </label>
              <textarea
                value={dailyGoal.notes}
                onChange={(e) => setDailyGoal(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Additional notes for today..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none h-20"
              />
            </div>

            <button
              onClick={saveGoals}
              className="w-full btn-primary disabled:opacity-50 transition-colors text-center"
            >
              Save Daily Goals
            </button>
          </AnimatedCard>

          {/* Planning Section */}
          <div className="space-y-6">
            {/* Weekly Focus */}
            <AnimatedCard className="p-6 card">
              <h2 className="text-lg font-bold gradient-text mb-4">Weekly Focus Area</h2>
              <select
                value={weeklyFocus}
                onChange={(e) => setWeeklyFocus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none mb-4"
              >
                <option>Select focus area...</option>
                <option>Patience & Discipline</option>
                <option>Risk Management</option>
                <option>Entry Accuracy</option>
                <option>Exit Strategy</option>
                <option>Consistency</option>
                <option>Emotional Control</option>
              </select>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Choose one area to focus on this week
              </p>
            </AnimatedCard>
            <AnimatedCard className="p-6 card">
              <h2 className="text-lg font-bold gradient-text mb-4">Pre-Market Preparation</h2>
              <textarea
                value={preMarketNotes}
                onChange={(e) => setPreMarketNotes(e.target.value)}
                placeholder="Economic events, key levels, pairs to watch..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none h-24"
              />
            </AnimatedCard>

            {/* Post-Session */}
            <AnimatedCard className="p-6 card">
              <h2 className="text-lg font-bold gradient-text mb-4">Post-Session Review Prompts</h2>
              <ul className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
                <li>✓ Did you hit your daily goal?</li>
                <li>✓ What was your biggest win today?</li>
                <li>✓ What mistake did you make?</li>
                <li>✓ How was your emotional control?</li>
                <li>✓ What will you improve tomorrow?</li>
              </ul>
              <textarea
                value={postSessionNotes}
                onChange={(e) => setPostSessionNotes(e.target.value)}
                placeholder="Your reflections..."
                className="w-full mt-4 px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none h-24"
              />
            </AnimatedCard>
          </div>
        </div>
      </main>

      <Toaster position="bottom-right" />
    </div>
  );
}
