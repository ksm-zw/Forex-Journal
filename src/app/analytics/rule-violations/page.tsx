'use client';

import { useEffect, useState } from 'react';

export default function RuleViolationsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/analytics/rule-violations');
      const result = await res.json();
      setData(result);
    } catch (error) {
      console.error('Failed to fetch rule violations:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Rule Violations Analysis</h1>

      {data?.summary && (
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="p-4 bg-white border border-gray-200 rounded-lg">
            <p className="text-gray-600 text-sm">Total Trades</p>
            <p className="text-2xl font-bold">{data.summary.totalTrades}</p>
          </div>
          <div className="p-4 bg-white border border-gray-200 rounded-lg">
            <p className="text-gray-600 text-sm">Actual P&L</p>
            <p className="text-2xl font-bold">{data.summary.actualPL?.toFixed(2)}</p>
          </div>
          <div className="p-4 bg-white border border-gray-200 rounded-lg">
            <p className="text-gray-600 text-sm">Hypothetical P&L</p>
            <p className="text-2xl font-bold">{data.summary.hypotheticalPL?.toFixed(2)}</p>
          </div>
          <div className="p-4 bg-white border border-gray-200 rounded-lg">
            <p className="text-gray-600 text-sm">Cost from Violations</p>
            <p className="text-2xl font-bold text-red-600">{data.summary.costFromViolations?.toFixed(2)}</p>
          </div>
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-lg overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-100 border-b">
              <th className="text-left p-4 font-bold">Rule</th>
              <th className="text-right p-4 font-bold">Total</th>
              <th className="text-right p-4 font-bold">Violations</th>
              <th className="text-right p-4 font-bold">Adherence</th>
              <th className="text-right p-4 font-bold">Violation Rate</th>
            </tr>
          </thead>
          <tbody>
            {data?.ruleStatistics &&
              Object.entries(data.ruleStatistics).map(([ruleId, stats]: [string, any]) => (
                <tr key={ruleId} className="border-b hover:bg-gray-50">
                  <td className="p-4">{stats.ruleName}</td>
                  <td className="text-right p-4">{stats.totalTrades}</td>
                  <td className="text-right p-4">{stats.violations}</td>
                  <td className="text-right p-4">{stats.adherence}</td>
                  <td className="text-right p-4 text-red-600">{stats.violationRate}%</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
