'use client';

import { useState } from 'react';

interface CandleData {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface CandleDataImporterProps {
  onImport?: (candles: CandleData[]) => void;
  pair?: string;
  timeframe?: string;
}

export function CandleDataImporter({ onImport, pair = 'EUR/USD', timeframe = 'H1' }: CandleDataImporterProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [candles, setCandles] = useState<CandleData[]>([]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      const text = await file.text();
      const lines = text.split('\n');

      // Parse CSV format: timestamp,open,high,low,close,volume
      const parsedCandles: CandleData[] = lines
        .slice(1) // Skip header
        .filter((line) => line.trim())
        .map((line) => {
          const [timestamp, open, high, low, close, volume] = line.split(',').map(Number);
          return { timestamp, open, high, low, close, volume };
        });

      setCandles(parsedCandles);
      onImport?.(parsedCandles);
    } catch (err) {
      setError(`Failed to parse file: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const generateSampleData = () => {
    const now = Date.now();
    const samples: CandleData[] = [];

    for (let i = 0; i < 50; i++) {
      const open = 1.08 + Math.random() * 0.02;
      const close = open + (Math.random() - 0.5) * 0.005;
      const high = Math.max(open, close) + Math.random() * 0.002;
      const low = Math.min(open, close) - Math.random() * 0.002;

      samples.push({
        timestamp: now - (50 - i) * 3600000, // 1 hour intervals
        open: parseFloat(open.toFixed(5)),
        high: parseFloat(high.toFixed(5)),
        low: parseFloat(low.toFixed(5)),
        close: parseFloat(close.toFixed(5)),
        volume: Math.floor(1000 + Math.random() * 5000),
      });
    }

    setCandles(samples);
    onImport?.(samples);
  };

  return (
    <div className="border rounded-lg p-6 bg-card">
      <h3 className="text-lg font-semibold mb-4">Import Candle Data</h3>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Pair: {pair}</label>
          <label className="block text-sm font-medium mb-2">Timeframe: {timeframe}</label>
        </div>

        <div className="border-2 border-dashed rounded-lg p-6 text-center">
          <input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            disabled={loading}
            className="hidden"
            id="candle-file"
          />
          <label htmlFor="candle-file" className="cursor-pointer">
            <div className="text-sm text-muted-foreground mb-2">
              {loading ? 'Importing...' : 'Drag CSV file here or click to select'}
            </div>
            {candles.length > 0 && (
              <div className="text-sm font-medium text-green-600 mt-2">{candles.length} candles loaded</div>
            )}
          </label>
        </div>

        {error && <div className="text-sm text-red-600">{error}</div>}

        <div className="flex gap-2">
          <button
            onClick={generateSampleData}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            disabled={loading}
          >
            Generate Sample Data
          </button>
        </div>

        {candles.length > 0 && (
          <div className="mt-4 max-h-48 overflow-y-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b">
                  <th className="text-left">Date</th>
                  <th className="text-right">Open</th>
                  <th className="text-right">High</th>
                  <th className="text-right">Low</th>
                  <th className="text-right">Close</th>
                  <th className="text-right">Volume</th>
                </tr>
              </thead>
              <tbody>
                {candles.slice(0, 10).map((candle, idx) => (
                  <tr key={idx} className="border-b">
                    <td>{new Date(candle.timestamp).toLocaleString()}</td>
                    <td className="text-right">{candle.open.toFixed(5)}</td>
                    <td className="text-right">{candle.high.toFixed(5)}</td>
                    <td className="text-right">{candle.low.toFixed(5)}</td>
                    <td className="text-right">{candle.close.toFixed(5)}</td>
                    <td className="text-right">{candle.volume}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {candles.length > 10 && <div className="text-xs text-muted-foreground mt-2">...and {candles.length - 10} more</div>}
          </div>
        )}
      </div>
    </div>
  );
}
