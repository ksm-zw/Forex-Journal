'use client';

import { useState, useEffect } from 'react';
/* Header provided by AppShell */
import AnalyticsCharts from '@/components/AnalyticsChartsV2';
import YearlyHeatmap from '@/components/YearlyHeatmap';
import MonthlyPerformanceTable from '@/components/MonthlyPerformanceTable';
import { useTheme } from '@/context/ThemeContext';
import { Toaster } from 'react-hot-toast';
import AnimatedCard from '@/components/AnimatedCard';

export default function AnalyticsPage() {
  const { theme, toggleTheme } = useTheme();
  const [trades, setTrades] = useState<any[]>([]);
  const [mounted, setMounted] = useState(false);
  const [dateRange, setDateRange] = useState<{ start: string | null; end: string | null }>({ start: null, end: null });

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
          console.warn('Unexpected trades payload in analytics page', data);
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

  if (!mounted) {
    return <div className="min-h-screen bg-white dark:bg-slate-950" />;
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Analytics & Insights</h1>
          <p className="text-gray-600 dark:text-gray-400">Track your trading performance with detailed charts and metrics</p>
        </div>

        <div className="flex items-center gap-4 mb-4">
          <AnimatedCard className="flex-1 p-4">
            <AnalyticsCharts trades={trades} startDate={dateRange.start} endDate={dateRange.end} />
          </AnimatedCard>
          <div className="ml-auto text-sm text-gray-400">
            {dateRange.start && <div>Selected: <strong>{dateRange.start}</strong> {dateRange.end && <span>— <strong>{dateRange.end}</strong></span>}</div>}
            {(!dateRange.start && !dateRange.end) && <div className="text-gray-500">No date range selected</div>}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          <AnimatedCard className="p-4">
            <YearlyHeatmap trades={trades} onSelectRange={setDateRange} />
          </AnimatedCard>
          <AnimatedCard className="p-4">
            <MonthlyPerformanceTable trades={trades} />
          </AnimatedCard>
        </div>
      </main>

      <Toaster position="bottom-right" />
    </div>
  );
}
