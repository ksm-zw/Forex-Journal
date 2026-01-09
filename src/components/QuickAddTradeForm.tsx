'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX } from 'react-icons/fi';

interface QuickAddTradeFormProps {
  onClose: () => void;
  onTradeAdded?: () => void;
}

export default function QuickAddTradeForm({ onClose, onTradeAdded }: QuickAddTradeFormProps) {
  const [formData, setFormData] = useState({
    pair: 'EUR/USD',
    direction: 'LONG',
    entryPrice: '',
    exitPrice: '',
    stopLoss: '',
    takeProfit: '',
    volume: '',
    riskPercent: '2',
    entryTime: new Date().toISOString().slice(0, 16),
    exitTime: '',
    outcome: 'OPEN',
    status: 'open',
    strategy: '',
    setupType: 'Breakout',
    emotionalState: 'calm',
    setupQuality: '3',
    account: 'Personal',
    broker: '',
    notes: '',
    whatLearned: '',
    mistakes: [],
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target as HTMLInputElement;
    setFormData(prev => {
      if ((prev as any)[name] === value) return prev;
      return ({
        ...prev,
        [name]: value,
      });
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.entryPrice || !formData.pair) {
      toast.error('Please fill in pair and entry price');
      return;
    }

    try {
      setIsLoading(true);

      const profitLoss =
        formData.exitPrice && formData.volume
          ? (parseFloat(formData.exitPrice) - parseFloat(formData.entryPrice)) *
            parseFloat(formData.volume) * 100000
          : undefined;

      const response = await fetch('/api/trades', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': 'demo-user',
        },
        body: JSON.stringify({
          ...formData,
          profitLoss,
          entryPrice: parseFloat(formData.entryPrice),
          exitPrice: formData.exitPrice ? parseFloat(formData.exitPrice) : null,
          stopLoss: formData.stopLoss ? parseFloat(formData.stopLoss) : null,
          takeProfit: formData.takeProfit ? parseFloat(formData.takeProfit) : null,
          volume: parseFloat(String(formData.volume || 0)),
          riskPercent: parseFloat(formData.riskPercent),
          setupQuality: parseInt(formData.setupQuality),
        }),
      });

      if (response.ok) {
        toast.success('Trade added successfully!');
        setFormData({
          pair: 'EUR/USD',
          direction: 'LONG',
          entryPrice: '',
          exitPrice: '',
          stopLoss: '',
          takeProfit: '',
          volume: '',
          riskPercent: '2',
          entryTime: new Date().toISOString().slice(0, 16),
          exitTime: '',
          outcome: 'OPEN',
          status: 'open',
          strategy: '',
          setupType: 'Breakout',
          emotionalState: 'calm',
          setupQuality: '3',
          account: 'Personal',
          broker: '',
          notes: '',
          whatLearned: '',
          mistakes: [],
        });
        onClose();
        onTradeAdded?.();
      } else {
        toast.error('Failed to add trade');
      }
    } catch (error) {
      toast.error('Error adding trade');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px',
        }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          onClick={(e) => e.stopPropagation()}
          style={{
            backgroundColor: 'var(--card-bg)',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '600px',
            maxHeight: '90vh',
            overflowY: 'auto',
            border: '1px solid var(--card-border)',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '24px',
              borderBottom: '1px solid var(--card-border)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              position: 'sticky',
              top: 0,
              backgroundColor: 'var(--card-bg)',
            }}
          >
            <h2
              style={{
                fontSize: '20px',
                fontWeight: 'bold',
                margin: 0,
                color: 'var(--foreground)',
              }}
            >
              Add New Trade
            </h2>
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--foreground)',
                padding: '0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <FiX size={24} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              {/* Pair */}
              <div>
                <label style={{ fontSize: '12px', color: 'var(--neutral-color)', marginBottom: '8px', display: 'block', fontWeight: '600' }}>
                  Currency Pair
                </label>
                <select
                  name="pair"
                  value={formData.pair}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    backgroundColor: 'var(--background)',
                    border: '1px solid var(--card-border)',
                    borderRadius: '8px',
                    color: 'var(--foreground)',
                  }}
                >
                  <option>EUR/USD</option>
                  <option>GBP/USD</option>
                  <option>USD/JPY</option>
                  <option>AUD/USD</option>
                  <option>USD/CAD</option>
                  <option>NZD/USD</option>
                  <option>USD/CHF</option>
                  <option>GOLD</option>
                  <option>SP500</option>
                </select>
              </div>

              {/* Direction */}
              <div>
                <label style={{ fontSize: '12px', color: 'var(--neutral-color)', marginBottom: '8px', display: 'block', fontWeight: '600' }}>
                  Direction
                </label>
                <select
                  name="direction"
                  value={formData.direction}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    backgroundColor: 'var(--background)',
                    border: '1px solid var(--card-border)',
                    borderRadius: '8px',
                    color: 'var(--foreground)',
                  }}
                >
                  <option value="LONG">LONG 📈</option>
                  <option value="SHORT">SHORT 📉</option>
                </select>
              </div>

              {/* Entry Price */}
              <div>
                <label style={{ fontSize: '12px', color: 'var(--neutral-color)', marginBottom: '8px', display: 'block', fontWeight: '600' }}>
                  Entry Price
                </label>
                <input
                  type="number"
                  name="entryPrice"
                  step="0.00001"
                  placeholder="1.0850"
                  value={formData.entryPrice}
                  onChange={handleChange}
                  required
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    backgroundColor: 'var(--background)',
                    border: '1px solid var(--card-border)',
                    borderRadius: '8px',
                    color: 'var(--foreground)',
                  }}
                />
              </div>

              {/* Stop Loss */}
              <div>
                <label style={{ fontSize: '12px', color: 'var(--neutral-color)', marginBottom: '8px', display: 'block', fontWeight: '600' }}>
                  Stop Loss
                </label>
                <input
                  type="number"
                  name="stopLoss"
                  step="0.00001"
                  placeholder="1.0800"
                  value={formData.stopLoss}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    backgroundColor: 'var(--background)',
                    border: '1px solid var(--card-border)',
                    borderRadius: '8px',
                    color: 'var(--foreground)',
                  }}
                />
              </div>

              {/* Take Profit */}
              <div>
                <label style={{ fontSize: '12px', color: 'var(--neutral-color)', marginBottom: '8px', display: 'block', fontWeight: '600' }}>
                  Take Profit
                </label>
                <input
                  type="number"
                  name="takeProfit"
                  step="0.00001"
                  placeholder="1.0900"
                  value={formData.takeProfit}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    backgroundColor: 'var(--background)',
                    border: '1px solid var(--card-border)',
                    borderRadius: '8px',
                    color: 'var(--foreground)',
                  }}
                />
              </div>

              {/* Volume */}
              <div>
                <label style={{ fontSize: '12px', color: 'var(--neutral-color)', marginBottom: '8px', display: 'block', fontWeight: '600' }}>
                  Volume (Lots)
                </label>
                <input
                  type="number"
                  name="volume"
                  step="0.01"
                  placeholder="0.1"
                  value={formData.volume}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    backgroundColor: 'var(--background)',
                    border: '1px solid var(--card-border)',
                    borderRadius: '8px',
                    color: 'var(--foreground)',
                  }}
                />
              </div>

              {/* Risk % */}
              <div>
                <label style={{ fontSize: '12px', color: 'var(--neutral-color)', marginBottom: '8px', display: 'block', fontWeight: '600' }}>
                  Risk %
                </label>
                <input
                  type="number"
                  name="riskPercent"
                  step="0.1"
                  placeholder="2"
                  value={formData.riskPercent}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    backgroundColor: 'var(--background)',
                    border: '1px solid var(--card-border)',
                    borderRadius: '8px',
                    color: 'var(--foreground)',
                  }}
                />
              </div>

              {/* Account */}
              <div>
                <label style={{ fontSize: '12px', color: 'var(--neutral-color)', marginBottom: '8px', display: 'block', fontWeight: '600' }}>
                  Account
                </label>
                <select
                  name="account"
                  value={formData.account}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    backgroundColor: 'var(--background)',
                    border: '1px solid var(--card-border)',
                    borderRadius: '8px',
                    color: 'var(--foreground)',
                  }}
                >
                  <option>Personal</option>
                  <option>PropFirm</option>
                  <option>Demo</option>
                </select>
              </div>

              {/* Setup Type */}
              <div>
                <label style={{ fontSize: '12px', color: 'var(--neutral-color)', marginBottom: '8px', display: 'block', fontWeight: '600' }}>
                  Setup Type
                </label>
                <select
                  name="setupType"
                  value={formData.setupType}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    backgroundColor: 'var(--background)',
                    border: '1px solid var(--card-border)',
                    borderRadius: '8px',
                    color: 'var(--foreground)',
                  }}
                >
                  <option>Breakout</option>
                  <option>Pullback</option>
                  <option>Reversal</option>
                  <option>Scalp</option>
                  <option>Swing</option>
                  <option>News</option>
                </select>
              </div>

              {/* Emotional State */}
              <div>
                <label style={{ fontSize: '12px', color: 'var(--neutral-color)', marginBottom: '8px', display: 'block', fontWeight: '600' }}>
                  Emotional State
                </label>
                <select
                  name="emotionalState"
                  value={formData.emotionalState}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    backgroundColor: 'var(--background)',
                    border: '1px solid var(--card-border)',
                    borderRadius: '8px',
                    color: 'var(--foreground)',
                  }}
                >
                  <option value="calm">😌 Calm</option>
                  <option value="focused">🎯 Focused</option>
                  <option value="confident">💪 Confident</option>
                  <option value="rushed">⚡ Rushed</option>
                  <option value="frustrated">😤 Frustrated</option>
                  <option value="anxious">😰 Anxious</option>
                </select>
              </div>

              {/* Setup Quality */}
              <div>
                <label style={{ fontSize: '12px', color: 'var(--neutral-color)', marginBottom: '8px', display: 'block', fontWeight: '600' }}>
                  Setup Quality
                </label>
                <select
                  name="setupQuality"
                  value={formData.setupQuality}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    backgroundColor: 'var(--background)',
                    border: '1px solid var(--card-border)',
                    borderRadius: '8px',
                    color: 'var(--foreground)',
                  }}
                >
                  <option value="1">⭐ 1</option>
                  <option value="2">⭐⭐ 2</option>
                  <option value="3">⭐⭐⭐ 3</option>
                  <option value="4">⭐⭐⭐⭐ 4</option>
                  <option value="5">⭐⭐⭐⭐⭐ 5</option>
                </select>
              </div>
            </div>

            {/* Notes */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '12px', color: 'var(--neutral-color)', marginBottom: '8px', display: 'block', fontWeight: '600' }}>
                Trade Notes
              </label>
              <textarea
                name="notes"
                placeholder="Observations about this trade..."
                value={formData.notes}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  backgroundColor: 'var(--background)',
                  border: '1px solid var(--card-border)',
                  borderRadius: '8px',
                  color: 'var(--foreground)',
                  minHeight: '80px',
                  resize: 'vertical',
                  fontFamily: 'inherit',
                }}
              />
            </div>

            {/* Buttons */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary"
                style={{ opacity: isLoading ? 0.6 : 1 }}
              >
                {isLoading ? 'Adding...' : 'Add Trade'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="btn-compact"
                style={{ background: 'transparent', border: '1px solid var(--card-border)', color: 'var(--foreground)' }}
              >
                Cancel
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
