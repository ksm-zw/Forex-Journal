'use client';

import React, { useState } from 'react';
import { FiBell, FiSettings, FiMenu } from 'react-icons/fi';
import QuickAddTradeForm from './QuickAddTradeForm';

export default function DashboardHeader() {
  const [showAddTrade, setShowAddTrade] = useState(false);

  return (
    <>
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '10px 16px',
          borderBottom: '1px solid var(--card-border)',
          backgroundColor: 'transparent',
          minHeight: '56px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <h1
            style={{
              fontSize: '18px',
              fontWeight: '700',
              color: 'var(--foreground)',
              margin: 0,
            }}
          >
            Backtesting Dashboard
          </h1>
          <span style={{fontSize: '13px', color: 'var(--neutral-color)'}}>
            Performance & calendar overview
          </span>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          {/* Compact utility icons */}
          <button
            className="btn-compact w-9 h-9 rounded-md"
            style={{ border: '1px solid var(--card-border)', color: 'var(--foreground)' }}
            aria-label="Notifications"
          >
            <FiBell size={16} />
          </button>

          <button
            className="btn-compact w-9 h-9 rounded-md"
            style={{ border: '1px solid var(--card-border)', color: 'var(--foreground)' }}
            aria-label="Settings"
          >
            <FiSettings size={16} />
          </button>

          {/* Small Add fab */}
          <button
            onClick={() => setShowAddTrade(true)}
            aria-label="Add trade"
            className="btn-compact btn-primary rounded-md w-10 h-10 flex items-center justify-center"
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
