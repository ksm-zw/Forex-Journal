'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import DashboardHeaderV3 from '@/components/DashboardHeaderV3';

interface Strategy {
  id: string;
  strategy_name: string;
  description: string;
  market_type: string;
  allowed_sessions: string;
  max_trades_per_day: number;
  default_risk_percent: number;
  expected_rr_min: number;
}

export default function StrategyDetailPage() {
  const params = useParams();
  const strategyId = params.id as string;
  const [strategy, setStrategy] = useState<Strategy | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStrategy = async () => {
      try {
        const res = await fetch(`/api/strategies/${strategyId}`, {
          headers: { 'x-user-id': 'demo@forex-research.com' },
        });
        if (res.ok) {
          const data = await res.json();
          setStrategy(data.strategy);
        }
      } catch (error) {
        console.error('Failed to fetch strategy:', error);
      } finally {
        setLoading(false);
      }
    };

    if (strategyId) fetchStrategy();
  }, [strategyId]);

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeaderV3 />
      <div className="container mx-auto py-8">
        {loading ? (
          <div className="text-center py-12">Loading strategy...</div>
        ) : !strategy ? (
          <div className="text-center py-12 text-muted-foreground">Strategy not found</div>
        ) : (
          <>
            <div className="mb-8">
              <h1 className="text-4xl font-bold mb-2">{strategy.strategy_name}</h1>
              <p className="text-muted-foreground text-lg">{strategy.description}</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
              <div className="border rounded-lg p-4">
                <div className="text-sm text-muted-foreground">Market Type</div>
                <div className="text-2xl font-bold mt-2">{strategy.market_type}</div>
              </div>
              <div className="border rounded-lg p-4">
                <div className="text-sm text-muted-foreground">Sessions</div>
                <div className="text-sm mt-2">{strategy.allowed_sessions}</div>
              </div>
              <div className="border rounded-lg p-4">
                <div className="text-sm text-muted-foreground">Max Trades/Day</div>
                <div className="text-2xl font-bold mt-2">{strategy.max_trades_per_day}</div>
              </div>
              <div className="border rounded-lg p-4">
                <div className="text-sm text-muted-foreground">Risk per Trade</div>
                <div className="text-2xl font-bold mt-2">{strategy.default_risk_percent}%</div>
              </div>
            </div>

            <div className="border-t pt-8">
              <h2 className="text-2xl font-bold mb-4">Strategy Configuration</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-semibold mb-4">Entry Models</h3>
                  <button className="btn-primary">
                    Add Entry Model
                  </button>
                </div>
                <div>
                  <h3 className="font-semibold mb-4">Timeframe Roles</h3>
                  <button className="btn-primary">
                    Add Timeframe Role
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
