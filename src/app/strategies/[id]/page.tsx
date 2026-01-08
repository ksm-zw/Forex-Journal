'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

interface StrategyDetail {
  id: string;
  strategy_name: string;
  description: string;
  market_type: string;
  entry_models: any[];
  timeframe_roles: any[];
  rules: any[];
}

export default function StrategyDetailPage() {
  const params = useParams();
  const strategyId = params.id as string;
  const [strategy, setStrategy] = useState<StrategyDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchStrategy();
  }, [strategyId]);

  const fetchStrategy = async () => {
    try {
      const res = await fetch(`/api/strategies/${strategyId}`);
      const data = await res.json();
      setStrategy(data.strategy);
    } catch (error) {
      console.error('Failed to fetch strategy:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;
  if (!strategy) return <div className="p-8">Strategy not found</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{strategy.strategy_name}</h1>
        <p className="text-gray-600">{strategy.description}</p>
        <div className="mt-4 inline-block px-3 py-1 rounded bg-blue-100 text-blue-800">
          {strategy.market_type}
        </div>
      </div>

      <div className="flex gap-4 border-b mb-6">
        {['overview', 'entry-models', 'timeframes', 'rules'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-medium ${
              activeTab === tab ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1).replace('-', ' ')}
          </button>
        ))}
      </div>

      <div className="bg-white p-6 rounded-lg border border-gray-200">
        {activeTab === 'overview' && (
          <div>
            <h2 className="text-xl font-bold mb-4">Strategy Overview</h2>
            <div className="space-y-2 text-gray-700">
              <p>
                <span className="font-medium">Entry Models:</span> {strategy.entry_models.length}
              </p>
              <p>
                <span className="font-medium">Timeframe Roles:</span> {strategy.timeframe_roles.length}
              </p>
              <p>
                <span className="font-medium">Rules:</span> {strategy.rules.length}
              </p>
            </div>
          </div>
        )}

        {activeTab === 'entry-models' && (
          <div>
            <h2 className="text-xl font-bold mb-4">Entry Models</h2>
            {strategy.entry_models.length === 0 ? (
              <p className="text-gray-500">No entry models yet</p>
            ) : (
              <div className="space-y-3">
                {strategy.entry_models.map((model: any) => (
                  <div key={model.id} className="p-3 bg-gray-50 rounded border border-gray-200">
                    <p className="font-medium">{model.name}</p>
                    <p className="text-sm text-gray-600">
                      Type: {model.confirmation_type} | Profile: {model.risk_profile}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'timeframes' && (
          <div>
            <h2 className="text-xl font-bold mb-4">Timeframe Sequence</h2>
            {strategy.timeframe_roles.length === 0 ? (
              <p className="text-gray-500">No timeframe roles yet</p>
            ) : (
              <div className="space-y-2">
                {strategy.timeframe_roles.map((role: any, idx: number) => (
                  <div
                    key={role.id}
                    className="p-3 bg-gray-50 rounded border border-gray-200 flex items-center gap-3"
                  >
                    <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">
                      {idx + 1}
                    </span>
                    <span className="font-medium">{role.timeframe}</span>
                    <span className="text-sm text-gray-600">{role.role_type}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'rules' && (
          <div>
            <h2 className="text-xl font-bold mb-4">Strategy Rules</h2>
            {strategy.rules.length === 0 ? (
              <p className="text-gray-500">No rules yet</p>
            ) : (
              <div className="space-y-3">
                {strategy.rules.map((rule: any) => (
                  <div key={rule.id} className="p-3 bg-gray-50 rounded border border-gray-200">
                    <div className="flex justify-between items-start">
                      <p className="font-medium">{rule.description}</p>
                      <span className="text-sm px-2 py-1 rounded bg-yellow-100 text-yellow-800">
                        Weight: {rule.weight}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">Type: {rule.rule_type}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
