'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Strategy {
  id: string;
  strategy_name: string;
  description: string;
  market_type: string;
  _count: {
    trades: number;
    entry_models: number;
    rules: number;
    timeframe_roles: number;
  };
}

export default function StrategiesPage() {
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    strategy_name: '',
    description: '',
    market_type: 'trend',
    allowed_sessions: 'London,NY',
    max_trades_per_day: 5,
    default_risk_percent: 2,
  });

  useEffect(() => {
    fetchStrategies();
  }, []);

  const fetchStrategies = async () => {
    try {
      const res = await fetch('/api/strategies');
      const data = await res.json();
      setStrategies(data.strategies || []);
    } catch (error) {
      console.error('Failed to fetch strategies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/strategies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setFormData({
          strategy_name: '',
          description: '',
          market_type: 'trend',
          allowed_sessions: 'London,NY',
          max_trades_per_day: 5,
          default_risk_percent: 2,
        });
        setShowForm(false);
        fetchStrategies();
      }
    } catch (error) {
      console.error('Failed to create strategy:', error);
    }
  };

  if (loading) {
    return <div className="p-8">Loading strategies...</div>;
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Strategies</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          {showForm ? 'Cancel' : '+ New Strategy'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-gray-50 p-6 rounded-lg mb-8 border border-gray-200">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Strategy Name</label>
              <input
                type="text"
                value={formData.strategy_name}
                onChange={(e) => setFormData({ ...formData, strategy_name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Market Type</label>
              <select
                value={formData.market_type}
                onChange={(e) => setFormData({ ...formData, market_type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="trend">Trend</option>
                <option value="range">Range</option>
                <option value="mixed">Mixed</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                rows={2}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Max Trades/Day</label>
              <input
                type="number"
                value={formData.max_trades_per_day}
                onChange={(e) => setFormData({ ...formData, max_trades_per_day: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Default Risk %</label>
              <input
                type="number"
                step="0.1"
                value={formData.default_risk_percent}
                onChange={(e) => setFormData({ ...formData, default_risk_percent: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>
          <button type="submit" className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
            Create Strategy
          </button>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {strategies.length === 0 ? (
          <div className="col-span-2 text-center py-12">
            <p className="text-gray-500">No strategies yet. Create your first strategy to get started.</p>
          </div>
        ) : (
          strategies.map((strategy) => (
            <Link
              key={strategy.id}
              href={`/strategies/${strategy.id}`}
              className="block p-6 bg-white border border-gray-200 rounded-lg hover:shadow-lg transition-shadow"
            >
              <h2 className="text-xl font-bold mb-2">{strategy.strategy_name}</h2>
              <p className="text-gray-600 text-sm mb-4">{strategy.description}</p>
              <div className="flex flex-wrap gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Trades:</span>
                  <span className="font-bold ml-1">{strategy._count.trades}</span>
                </div>
                <div>
                  <span className="text-gray-500">Models:</span>
                  <span className="font-bold ml-1">{strategy._count.entry_models}</span>
                </div>
                <div>
                  <span className="text-gray-500">Rules:</span>
                  <span className="font-bold ml-1">{strategy._count.rules}</span>
                </div>
                <div>
                  <span className="text-gray-500">Timeframes:</span>
                  <span className="font-bold ml-1">{strategy._count.timeframe_roles}</span>
                </div>
              </div>
              <div className="mt-4 inline-block px-2 py-1 rounded bg-blue-100 text-blue-800 text-xs">
                {strategy.market_type}
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
