'use client';

import React, { useState } from 'react';
import { FiBell, FiSettings, FiMenu } from 'react-icons/fi';
import QuickAddTradeForm from './QuickAddTradeForm';

export default function DashboardHeader() {
  const [showAddTrade, setShowAddTrade] = useState(false);

  return (
    <>
      <header className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'var(--card-border)' }}>
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-bold gradient-text">Backtesting Dashboard</h1>
          <span className="text-sm" style={{ color: 'var(--neutral-color)' }}>Performance & calendar overview</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            className="btn-compact w-9 h-9 rounded-md border"
            style={{ borderColor: 'var(--card-border)', color: 'var(--foreground)' }}
            aria-label="Notifications"
          >
            <FiBell size={16} />
          </button>

          <button
            className="btn-compact w-9 h-9 rounded-md border"
            style={{ borderColor: 'var(--card-border)', color: 'var(--foreground)' }}
            aria-label="Settings"
          >
            <FiSettings size={16} />
          </button>

          <button
            onClick={() => setShowAddTrade(true)}
            aria-label="Add trade"
            className="btn-primary w-10 h-10 rounded-md flex items-center justify-center"
          >
            +
          </button>
        </div>
      </header>

      {showAddTrade && (
        <QuickAddTradeForm onClose={() => setShowAddTrade(false)} />
      )}
    </>
  );
}
