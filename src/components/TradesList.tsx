'use client';

import { FiTrash2, FiEdit } from 'react-icons/fi';
import toast from 'react-hot-toast';

interface Trade {
  id: string;
  pair: string;
  direction: string;
  entryPrice: number;
  exitPrice?: number;
  profitLoss?: number;
  outcome?: string;
  entryTime: string;
  strategy?: string;
  setupQuality?: number;
  notes?: string;
}

interface TradesListProps {
  trades: Trade[];
  isLoading: boolean;
  onTradeDeleted: () => void;
}

export default function TradesList({ trades, isLoading, onTradeDeleted }: TradesListProps) {
  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this trade?')) {
      try {
        const response = await fetch(`/api/trades/${id}`, {
          method: 'DELETE',
          headers: {
            'x-user-id': 'demo-user',
          },
        });

        if (response.ok) {
          toast.success('Trade deleted');
          onTradeDeleted();
        }
      } catch (error) {
        toast.error('Failed to delete trade');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="card p-8">
        <div className="flex justify-center">
          <div className="animate-spin">⏳</div>
        </div>
      </div>
    );
  }

  if (!trades.length) {
    return (
      <div className="card p-8 text-center">
        <p className="text-gray-500 dark:text-gray-400">No trades recorded yet. Add your first trade to get started!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-gray-900 dark:text-white">Recent Trades</h2>

      <div className="space-y-3">
        {trades.map((trade) => (
          <div
            key={trade.id}
            className="card p-4 hover:shadow-md transition-shadow"          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <div className="text-lg font-bold text-gray-900 dark:text-white">
                    {trade.pair}
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    trade.direction === 'LONG'
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                      : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                  }`}>
                    {trade.direction}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    trade.outcome === 'WIN'
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                      : trade.outcome === 'LOSS'
                      ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}>
                    {trade.outcome || 'Open'}
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500 dark:text-gray-400 text-xs">Entry Price</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{trade.entryPrice.toFixed(5)}</p>
                  </div>
                  {trade.exitPrice && (
                    <div>
                      <p className="text-gray-500 dark:text-gray-400 text-xs">Exit Price</p>
                      <p className="font-semibold text-gray-900 dark:text-white">{trade.exitPrice.toFixed(5)}</p>
                    </div>
                  )}
                  {trade.profitLoss !== undefined && (
                    <div>
                      <p className="text-gray-500 dark:text-gray-400 text-xs">P&L</p>
                      <p className={`font-semibold ${trade.profitLoss >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        {trade.profitLoss >= 0 ? '+' : ''}{trade.profitLoss.toFixed(2)}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-gray-500 dark:text-gray-400 text-xs">Date</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {new Date(trade.entryTime).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {trade.strategy && (
                  <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                    Strategy: <span className="font-semibold">{trade.strategy}</span>
                  </p>
                )}

                {trade.notes && (
                  <p className="mt-2 text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                    {trade.notes}
                  </p>
                )}

                {trade.setupQuality && (
                  <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                    Quality: {['⭐', '⭐⭐', '⭐⭐⭐', '⭐⭐⭐⭐', '⭐⭐⭐⭐⭐'][trade.setupQuality - 1]}
                  </p>
                )}
              </div>

              <div className="flex gap-2 ml-4">
                <button
                  onClick={() => handleDelete(trade.id)}
                  className="p-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                  title="Delete trade"
                >
                  <FiTrash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
