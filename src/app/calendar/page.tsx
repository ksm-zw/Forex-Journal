'use client';

import { useState, useEffect, useMemo } from 'react';
import DashboardHeaderV3 from '@/components/DashboardHeaderV3';
import { Toaster } from 'react-hot-toast';
import AnimatedCard from '@/components/AnimatedCard';

interface Trade {
  id: string;
  pair: string;
  direction: string;
  outcome?: string;
  profitLoss?: number;
  entryTime: string;
}

export default function CalendarPage() {
  // Header component v3 used across the app
  const [mounted, setMounted] = useState(false);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

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
          console.warn('Unexpected trades payload in calendar page', data);
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

  const tradesByDate = useMemo(() => {
    const grouped: { [key: string]: Trade[] } = {};
    trades.forEach(trade => {
      const date = new Date(trade.entryTime).toISOString().split('T')[0];
      if (!grouped[date]) grouped[date] = [];
      grouped[date].push(trade);
    });
    return grouped;
  }, [trades]);

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const days = Array.from({ length: getDaysInMonth(currentMonth) }, (_, i) => i + 1);
  const firstDay = getFirstDayOfMonth(currentMonth);
  const emptyDays = Array.from({ length: firstDay }, (_, i) => null);

  const calendarDays = [...emptyDays, ...days];

  const selectedDateTrades = selectedDate ? tradesByDate[selectedDate] || [] : [];

  const getDayStats = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day).toISOString().split('T')[0];
    const dayTrades = tradesByDate[date] || [];
    const pnl = dayTrades.reduce((sum, t) => sum + (t.profitLoss || 0), 0);
    const wins = dayTrades.filter(t => t.outcome === 'WIN').length;
    return { count: dayTrades.length, pnl, wins };
  };

  if (!mounted) {
    return <div className="min-h-screen bg-white dark:bg-slate-950" />;
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <DashboardHeaderV3 />

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold gradient-text mb-2">Trading Calendar</h1>
          <p className="text-gray-600 dark:text-gray-400">View your trades by day</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Calendar */}
          <AnimatedCard className="lg:col-span-2 p-6 animate-slideUp">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold gradient-text">
                {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                  className="btn-compact rounded-md"
                  style={{ border: '1px solid var(--card-border)' }}
                >
                  ← Prev
                </button>
                <button
                  onClick={() => setCurrentMonth(new Date())}
                  className="btn-compact btn-primary"
                >
                  Today
                </button>
                <button
                  onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                  className="btn-compact rounded-md"
                  style={{ border: '1px solid var(--card-border)' }}
                >
                  Next →
                </button>
              </div>
            </div> 

            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-2 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center font-semibold text-gray-700 dark:text-gray-300 text-xs py-1">
                  {day}
                </div>
              ))}
            </div>

            {/* Days */}
            <div className="calendar-grid">
              {calendarDays.map((day, idx) => {
                if (day === null) {
                  return <div key={`empty-${idx}`} className="calendar-day" />;
                }

                const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day).toISOString().split('T')[0];
                const stats = getDayStats(day);
                const isSelected = selectedDate === date;

                return (
                  <button
                    key={day}
                    onClick={() => setSelectedDate(isSelected ? null : date)}
                    className={`calendar-day rounded-lg border-2 transition-colors font-semibold animate-fadeIn ${
                      isSelected
                        ? 'bg-purple-600 border-purple-600 text-white dark:bg-purple-700 dark:border-purple-700'
                        : stats.count > 0
                        ? stats.pnl >= 0
                          ? 'bg-green-100 border-green-300 dark:bg-green-900/30 dark:border-green-700 text-green-900 dark:text-green-100'
                          : 'bg-red-100 border-red-300 dark:bg-red-900/30 dark:border-red-700 text-red-900 dark:text-red-100'
                        : 'bg-gray-100 border-gray-300 dark:bg-slate-700 dark:border-slate-600 text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    <div className="w-full flex items-start justify-between">
                      <div className="text-sm font-semibold">{day}</div>
                      {stats.count > 0 && (
                        <div className="text-[11px]">{stats.count}T</div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="mt-6 flex flex-wrap gap-4 calendar-legend">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-100 dark:bg-green-900/30 rounded border-2 border-green-300 dark:border-green-700" />
                <span className="text-gray-700 dark:text-gray-300">Winning Day</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-100 dark:bg-red-900/30 rounded border-2 border-red-300 dark:border-red-700" />
                <span className="text-gray-700 dark:text-gray-300">Losing Day</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-100 dark:bg-slate-700 rounded border-2 border-gray-300 dark:border-slate-600" />
                <span className="text-gray-700 dark:text-gray-300">No Trades</span>
              </div>
            </div>
          </AnimatedCard>

          {/* Selected Date Trades */}
          <AnimatedCard className="p-6 animate-slideUp">
            <h2 className="text-lg font-bold gradient-text mb-4">
              {selectedDate ? new Date(selectedDate + 'T00:00:00').toLocaleDateString() : 'Select a date'}
            </h2>

            {selectedDateTrades.length > 0 ? (
              <div className="space-y-3">
                {selectedDateTrades.map(trade => (
                  <div key={trade.id} className="card p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-gray-900 dark:text-white text-sm">{trade.pair}</span>
                      <span className={`text-xs font-semibold px-2 py-1 rounded ${
                        trade.outcome === 'WIN'
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                          : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                      }`}>
                        {trade.outcome || 'Open'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600 dark:text-gray-400">{trade.direction}</span>
                      <span className={trade.profitLoss && trade.profitLoss >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                        {trade.profitLoss !== undefined ? `${trade.profitLoss >= 0 ? '+' : ''}${trade.profitLoss.toFixed(2)}` : 'N/A'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {selectedDate ? 'No trades on this date' : 'Select a date to view trades'}
              </p>
            )}
          </AnimatedCard>
        </div>
      </main>

      <Toaster position="bottom-right" />
    </div>
  );
}
