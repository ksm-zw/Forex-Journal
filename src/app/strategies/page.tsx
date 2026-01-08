'use client';

import { useEffect, useState } from 'react';
import DashboardHeaderV3 from '@/components/DashboardHeaderV3';

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

  useEffect(() => {
    const fetchStrategies = async () => {
      try {
        const res = await fetch('/api/strategies', {
          headers: { 'x-user-id': 'demo@forex-research.com' },
        });
        if (res.ok) {
          const data = await res.json();
          setStrategies(data.strategies);
        }
      } catch (error) {
        console.error('Failed to fetch strategies:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStrategies();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeaderV3 />
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Trading Strategies</h1>
          <p className="text-muted-foreground">
            Manage your trading strategies and monitor their performance
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">Loading strategies...</div>
        ) : strategies.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No strategies found. Create your first strategy to get started.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {strategies.map((strategy) => (
              <div
                key={strategy.id}
                className="border rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => (window.location.href = `/strategies/${strategy.id}`)}
              >
                <h3 className="text-lg font-semibold mb-2">{strategy.strategy_name}</h3>
                <p className="text-sm text-muted-foreground mb-4">{strategy.description}</p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Trades:</span> {strategy._count.trades}
                  </div>
                  <div>
                    <span className="font-medium">Rules:</span> {strategy._count.rules}
                  </div>
                  <div>
                    <span className="font-medium">Entry Models:</span> {strategy._count.entry_models}
                  </div>
                  <div>
                    <span className="font-medium">Timeframes:</span> {strategy._count.timeframe_roles}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
