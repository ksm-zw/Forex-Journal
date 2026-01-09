'use client';

import { useMemo, useState, useEffect, useRef } from 'react';

interface Trade { entryTime: string; profitLoss?: number }

export default function YearlyHeatmap({ trades, onSelectRange }: { trades: Trade[]; onSelectRange?: (range: { start: string | null; end: string | null }) => void }) {
  const days = useMemo(() => {
    const map: Record<string, number> = {};
    const now = new Date();
    for (let i = 0; i < 365; i++) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      map[d.toISOString().slice(0, 10)] = 0;
    }

    function safeDateKey(value: any): string | null {
      if (!value) return null;
      // Try to parse common formats and timestamps
      const parsed = typeof value === 'number' ? new Date(value) : new Date(String(value));
      if (!(parsed instanceof Date) || isNaN(parsed.getTime())) return null;
      return parsed.toISOString().slice(0, 10);
    }

    trades.forEach(t => {
      const key = safeDateKey((t as any).entryTime);
      if (!key) return; // skip invalid dates
      // only include within the last 365 days (map already initialized for those keys)
      if (typeof map[key] === 'undefined') {
        // ignore out-of-range dates
        return;
      }
      map[key] = (map[key] || 0) + (t.profitLoss || 0);
    });

    return Object.entries(map).map(([day, pnl]) => ({ day, pnl }));
  }, [trades]);

  const max = Math.max(...days.map(d => Math.abs(d.pnl)), 1);

  const [start, setStart] = useState<string | null>(null);
  const [end, setEnd] = useState<string | null>(null);

  // Avoid calling parent's setter on initial mount to prevent update loops
  const initialRef = useRef(true);
  useEffect(() => {
    if (!onSelectRange) return;
    if (initialRef.current) {
      initialRef.current = false;
      return;
    }
    onSelectRange({ start, end });
  // intentionally exclude onSelectRange from deps to rely on stable setter passed from parent
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [start, end]);

  const [monthZoom, setMonthZoom] = useState(false);

  function handleClick(day: string) {
    if (monthZoom) {
      // Zoom to month of the clicked day
      const d = new Date(day);
      const startOfMonth = new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0,10);
      const endOfMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString().slice(0,10);
      setStart(startOfMonth);
      setEnd(endOfMonth);
      return;
    }

    // If no start, set start
    if (!start) {
      setStart(day);
      setEnd(null);
      return;
    }

    // If start exists and no end: set end (ensure proper order)
    if (start && !end) {
      if (day === start) {
        // toggle off
        setStart(null);
        setEnd(null);
        return;
      }
      // ensure chronological order
      const s = new Date(start);
      const d = new Date(day);
      if (d < s) {
        setStart(day);
        setEnd(s.toISOString().slice(0, 10));
      } else {
        setEnd(day);
      }
      return;
    }

    // If both set, start new selection at clicked day
    setStart(day);
    setEnd(null);
  }

  function isSelected(day: string) {
    if (!start) return false;
    if (start && !end) return day === start;
    // range
    const s = new Date(start);
    const e = new Date(end as string);
    const d = new Date(day);
    return d >= s && d <= e;
  }

  return (
    <div className="card p-4 animate-fadeIn">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold gradient-text mb-4">Yearly P&L Heatmap</h3>
        <div className="flex items-center gap-3">
          <div className="text-xs text-gray-400">
            {start && <span>From <strong>{start}</strong></span>} {end && <span> to <strong>{end}</strong></span>}
            {(start || end) && <button className="ml-3 text-sm text-blue-400" onClick={() => { setStart(null); setEnd(null); if (onSelectRange) onSelectRange({ start: null, end: null }); }}>Clear</button>}
          </div>
          <button type="button" aria-pressed={monthZoom} aria-label="Toggle month zoom" className={`btn-compact rounded-md ${monthZoom ? 'btn-primary text-white' : 'border'}`} onClick={() => setMonthZoom(s => !s)}>
            {monthZoom ? 'Month Zoom: ON' : 'Month Zoom: OFF'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-52 gap-1" role="grid" aria-label="Yearly profit/loss heatmap" style={{gap: '6px'}}>
        {days.map(d => {
          const intensity = Math.min(1, Math.abs(d.pnl) / max);
          const bg = d.pnl > 0 ? `rgba(16,185,129,${0.14 + intensity * 0.86})` : d.pnl < 0 ? `rgba(239,68,68,${0.14 + intensity * 0.86})` : 'transparent';
          const selected = isSelected(d.day);
          const borderStyle = selected ? { boxShadow: '0 0 0 3px rgba(99,102,241,0.12)', outline: 'none' } : {};
          const showLabel = Math.abs(d.pnl) > (max * 0.25);

          return (
            <button
              key={d.day}
              title={`${d.day}: ${d.pnl}`}
              aria-pressed={selected}
              onClick={() => handleClick(d.day)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleClick(d.day);
                }
              }}
              style={{ background: bg, width: '36px', height: '36px', borderRadius: '8px', color: 'var(--foreground)', fontSize: '11px', ...borderStyle }}
              className={`w-9 h-9 rounded-md flex items-center justify-center text-xs transition-shadow focus:outline-none`}
            >
              {showLabel ? (d.pnl > 0 ? `+$${Math.round(d.pnl)}` : `-$${Math.abs(Math.round(d.pnl))}`) : ''}
            </button>
          );
        })}
      </div>
      <div className="text-xs text-gray-400 mt-2">Green = Profit, Pink = Loss. Click a day to set start, click another to set end. Toggle Month Zoom to select whole month on click. Clear to reset selection.</div>
    </div>
  );
}
