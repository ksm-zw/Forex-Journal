'use client';

import { useEffect, useState } from 'react';

export default function PeriodAnalysisPage() {
  const [analysis, setAnalysis] = useState<Record<string, any> | null>(null);
  const [period, setPeriod] = useState('month');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalysis();
  }, [period]);

  const fetchAnalysis = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/analytics/period-analysis?period=${period}`);
      const data = await res.json();
      setAnalysis(data.analysis);
    } catch (error) {
      console.error('Failed to fetch analysis:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Period Analysis</h1>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg"
        >
          <option value="day">Daily</option>
          <option value="week">Weekly</option>
          <option value="month">Monthly</option>
          <option value="quarter">Quarterly</option>
          <option value="half">Half-yearly</option>
          <option value="year">Yearly</option>
        </select>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : !analysis || Object.keys(analysis).length === 0 ? (
        <div className="text-center py-12 text-gray-500">No data for selected period</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(analysis).map(([periodKey, metrics]: [string, any]) => (
            <div key={periodKey} className="p-6 bg-white border border-gray-200 rounded-lg">
              <h3 className="font-bold text-lg mb-4">{periodKey}</h3>
              <div className="space-y-2 text-sm">
                <p>
                  <span className="text-gray-600">Trades:</span>
                  <span className="float-right font-medium">{metrics.closedTrades || 0}</span>
                </p>
                <p>
                  <span className="text-gray-600">Win Rate:</span>
                  <span className="float-right font-medium">{((metrics.winRate || 0) * 100).toFixed(1)}%</span>
                </p>
                <p>
                  <span className="text-gray-600">Expectancy:</span>
                  <span className="float-right font-medium">{(metrics.expectancy || 0).toFixed(2)}</span>
                </p>
                <p>
                  <span className="text-gray-600">Profit Factor:</span>
                  <span className="float-right font-medium">{(metrics.profitFactor || 0).toFixed(2)}</span>
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
