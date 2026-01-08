'use client';

import { useEffect, useState } from 'react';

interface StrategyAnalysis {
  name: string;
  totalTrades: number;
  closedTrades: number;
  wins: number;
  losses: number;
  winRate: number;
  expectancy: number;
  profitFactor: number;
  ruleViolationImpact: any;
}

export default function StrategyComparisonPage() {
  const [analysis, setAnalysis] = useState<Record<string, StrategyAnalysis> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalysis();
  }, []);

  const fetchAnalysis = async () => {
    try {
      const res = await fetch('/api/analytics/strategy-comparison');
      const data = await res.json();
      setAnalysis(data.analysis);
    } catch (error) {
      console.error('Failed to fetch analysis:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8">Loading analysis...</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Strategy Comparison</h1>

      {!analysis || Object.keys(analysis).length === 0 ? (
        <div className="text-center py-12 text-gray-500">No strategies to compare</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100 border-b-2 border-gray-300">
                <th className="text-left p-3 font-bold">Strategy</th>
                <th className="text-right p-3 font-bold">Trades</th>
                <th className="text-right p-3 font-bold">Win Rate</th>
                <th className="text-right p-3 font-bold">Expectancy</th>
                <th className="text-right p-3 font-bold">Profit Factor</th>
                <th className="text-right p-3 font-bold">Rule Impact</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(analysis).map(([id, stats]) => (
                <tr key={id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="p-3 font-medium">{stats.name}</td>
                  <td className="p-3 text-right">{stats.closedTrades}</td>
                  <td className="p-3 text-right">{(stats.winRate * 100).toFixed(1)}%</td>
                  <td className="p-3 text-right">{stats.expectancy.toFixed(2)}</td>
                  <td className="p-3 text-right">{stats.profitFactor.toFixed(2)}</td>
                  <td className="p-3 text-right text-red-600">{stats.ruleViolationImpact.impactFromViolations.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
