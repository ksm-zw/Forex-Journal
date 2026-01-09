'use client';

import { FiDownload } from 'react-icons/fi';
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
  emotionalState?: string;
  setupQuality?: number;
  notes?: string;
}

interface ExportButtonProps {
  trades: Trade[];
  format: 'csv' | 'json';
}

export default function ExportButton({ trades, format }: ExportButtonProps) {
  const exportToCSV = () => {
    if (trades.length === 0) {
      toast.error('No trades to export');
      return;
    }

    const headers = [
      'Pair',
      'Direction',
      'Entry Price',
      'Exit Price',
      'P&L',
      'Outcome',
      'Entry Time',
      'Strategy',
      'Emotional State',
      'Setup Quality',
      'Notes',
    ];

    const rows = trades.map(trade => [
      trade.pair,
      trade.direction,
      trade.entryPrice,
      trade.exitPrice || '',
      trade.profitLoss || '',
      trade.outcome || '',
      new Date(trade.entryTime).toLocaleString(),
      trade.strategy || '',
      trade.emotionalState || '',
      trade.setupQuality || '',
      trade.notes || '',
    ]);

    const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `trades-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success('Trades exported to CSV');
  };

  const exportToJSON = () => {
    if (trades.length === 0) {
      toast.error('No trades to export');
      return;
    }

    const json = JSON.stringify(trades, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `trades-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success('Trades exported to JSON');
  };

  const handleExport = () => {
    if (format === 'csv') {
      exportToCSV();
    } else {
      exportToJSON();
    }
  };

  return (
    <button
      onClick={handleExport}
      className="flex items-center gap-2 btn-primary px-4 rounded-lg transition-colors"
    >
      <FiDownload className="w-4 h-4" />
      Export {format.toUpperCase()}
    </button>
  );
}
