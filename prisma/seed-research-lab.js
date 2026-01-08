const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding research lab demo data...');

  // Delete existing demo data for this user first
  const existingUser = await prisma.user.findUnique({
    where: { email: 'demo@forex-research.com' },
  });

  if (existingUser) {
    console.log('🗑️  Clearing existing demo data for demo@forex-research.com...');
    await prisma.trade.deleteMany({ where: { userId: existingUser.id } });
    await prisma.strategy.deleteMany({ where: { userId: existingUser.id } });
    await prisma.user.delete({ where: { id: existingUser.id } });
  }

  // Create a demo user
  const user = await prisma.user.create({
    data: {
      email: 'demo@forex-research.com',
      password: 'hashed_password_demo',
      name: 'Demo Trader',
    },
  });

  console.log(`✅ User: ${user.name}`);

  // ========== STRATEGY 1: SCALPER (Aggressive, High Frequency) ==========
  const scalperStrategy = await prisma.strategy.create({
    data: {
      userId: user.id,
      strategy_name: 'Scalper - M5 Breakouts',
      description: 'Fast scalping strategy focusing on M5 timeframe breakouts with tight risk management',
      market_type: 'trend',
      allowed_sessions: 'London,NY',
      max_trades_per_day: 10,
      default_risk_percent: 1.0,
      expected_rr_min: 1.5,
      status: 'active',
    },
  });

  // Scalper Entry Models
  const scalperAggressiveModel = await prisma.entryModel.create({
    data: {
      strategy_id: scalperStrategy.id,
      model_name: 'Quick Break',
      description: 'Entry on immediate break of previous candle high with no pullback',
      confirmation_type: 'break_retest',
      risk_profile: 'aggressive',
    },
  });

  const scalperBalancedModel = await prisma.entryModel.create({
    data: {
      strategy_id: scalperStrategy.id,
      model_name: 'Retest Break',
      description: 'Entry on retest of broken level with candle close confirmation',
      confirmation_type: 'candle_close',
      risk_profile: 'balanced',
    },
  });

  // Scalper Timeframe Roles
  const scalperRoles = [
    { timeframe: 'H1', role_type: 'bias', order_index: 1 },
    { timeframe: 'M15', role_type: 'structure', order_index: 2 },
    { timeframe: 'M5', role_type: 'entry', order_index: 3 },
    { timeframe: 'M1', role_type: 'execution', order_index: 4 },
  ];

  for (const role of scalperRoles) {
    await prisma.timeframeRole.create({
      data: {
        strategy_id: scalperStrategy.id,
        timeframe: role.timeframe,
        role_type: role.role_type,
        order_index: role.order_index,
        description: `${role.role_type} on ${role.timeframe}`,
      },
    });
  }

  // Scalper Rules
  const scalperRules = [
    {
      description: 'Always use a stop loss (minimum 5 pips)',
      rule_type: 'mandatory',
      weight: 2.0,
    },
    {
      description: 'Do not trade outside 08:00-16:00 London time',
      rule_type: 'mandatory',
      weight: 1.5,
    },
    {
      description: 'Risk no more than 1% per trade',
      rule_type: 'mandatory',
      weight: 2.0,
    },
    {
      description: 'Take profit at 1.5R minimum',
      rule_type: 'optional',
      weight: 1.0,
    },
    {
      description: 'Avoid trading before economic news',
      rule_type: 'mandatory',
      weight: 1.5,
    },
  ];

  const createdScalperRules = [];
  for (const rule of scalperRules) {
    const created = await prisma.strategyRule.create({
      data: {
        strategy_id: scalperStrategy.id,
        ...rule,
      },
    });
    createdScalperRules.push(created);
  }

  console.log(`✅ Strategy: ${scalperStrategy.strategy_name}`);

  // ========== STRATEGY 2: SWING TRADER (Balanced, Multi-Day) ==========
  const swingStrategy = await prisma.strategy.create({
    data: {
      userId: user.id,
      strategy_name: 'Swing Trader - Daily Pullbacks',
      description: 'Multi-day swing strategy capturing 50-100 pip moves on major pairs',
      market_type: 'mixed',
      allowed_sessions: 'Asia,London,NY',
      max_trades_per_day: 3,
      default_risk_percent: 2.0,
      expected_rr_min: 2.0,
      status: 'active',
    },
  });

  const swingBalancedModel = await prisma.entryModel.create({
    data: {
      strategy_id: swingStrategy.id,
      model_name: 'Pullback Entry',
      description: 'Enter on pullback to key support/resistance levels',
      confirmation_type: 'liquidity_sweep',
      risk_profile: 'balanced',
    },
  });

  const swingRoles = [
    { timeframe: 'W1', role_type: 'bias', order_index: 1 },
    { timeframe: 'D1', role_type: 'structure', order_index: 2 },
    { timeframe: 'H4', role_type: 'poi', order_index: 3 },
    { timeframe: 'H1', role_type: 'entry', order_index: 4 },
  ];

  for (const role of swingRoles) {
    await prisma.timeframeRole.create({
      data: {
        strategy_id: swingStrategy.id,
        timeframe: role.timeframe,
        role_type: role.role_type,
        order_index: role.order_index,
        description: `${role.role_type} on ${role.timeframe}`,
      },
    });
  }

  const swingRules = [
    {
      description: 'Confirm trend direction on W1 before entry',
      rule_type: 'mandatory',
      weight: 2.0,
    },
    {
      description: 'Only trade pullbacks to 0.618 Fibonacci or lower',
      rule_type: 'optional',
      weight: 1.0,
    },
    {
      description: 'Risk 2% per trade maximum',
      rule_type: 'mandatory',
      weight: 2.0,
    },
    {
      description: 'Hold minimum 2:1 risk:reward ratio',
      rule_type: 'mandatory',
      weight: 1.5,
    },
    {
      description: 'Do not add to losing positions',
      rule_type: 'mandatory',
      weight: 1.5,
    },
  ];

  const createdSwingRules = [];
  for (const rule of swingRules) {
    const created = await prisma.strategyRule.create({
      data: {
        strategy_id: swingStrategy.id,
        ...rule,
      },
    });
    createdSwingRules.push(created);
  }

  console.log(`✅ Strategy: ${swingStrategy.strategy_name}`);

  // ========== STRATEGY 3: POSITION TRADER (Conservative, Long-Term) ==========
  const positionStrategy = await prisma.strategy.create({
    data: {
      userId: user.id,
      strategy_name: 'Position Trader - Macro Trends',
      description: 'Long-term position trading following macro trends, 200+ pips per trade',
      market_type: 'trend',
      allowed_sessions: 'Asia,London,NY',
      max_trades_per_day: 1,
      default_risk_percent: 1.5,
      expected_rr_min: 3.0,
      status: 'active',
    },
  });

  const positionConservativeModel = await prisma.entryModel.create({
    data: {
      strategy_id: positionStrategy.id,
      model_name: 'Break & Hold',
      description: 'Entry on structural break with strong daily close confirmation',
      confirmation_type: 'candle_close',
      risk_profile: 'conservative',
    },
  });

  const positionRoles = [
    { timeframe: 'W1', role_type: 'bias', order_index: 1 },
    { timeframe: 'D1', role_type: 'structure', order_index: 2 },
    { timeframe: 'H4', role_type: 'confirmation', order_index: 3 },
    { timeframe: 'H1', role_type: 'entry', order_index: 4 },
  ];

  for (const role of positionRoles) {
    await prisma.timeframeRole.create({
      data: {
        strategy_id: positionStrategy.id,
        timeframe: role.timeframe,
        role_type: role.role_type,
        order_index: role.order_index,
        description: `${role.role_type} on ${role.timeframe}`,
      },
    });
  }

  const positionRules = [
    {
      description: 'Trade only in direction of W1 trend',
      rule_type: 'mandatory',
      weight: 2.5,
    },
    {
      description: 'Wait for D1 candle close confirmation',
      rule_type: 'mandatory',
      weight: 2.0,
    },
    {
      description: 'Risk only 1.5% per trade',
      rule_type: 'mandatory',
      weight: 1.5,
    },
    {
      description: 'Never move stop loss against position',
      rule_type: 'mandatory',
      weight: 2.0,
    },
    {
      description: 'Aim for minimum 3:1 risk:reward',
      rule_type: 'mandatory',
      weight: 1.5,
    },
  ];

  const createdPositionRules = [];
  for (const rule of positionRules) {
    const created = await prisma.strategyRule.create({
      data: {
        strategy_id: positionStrategy.id,
        ...rule,
      },
    });
    createdPositionRules.push(created);
  }

  console.log(`✅ Strategy: ${positionStrategy.strategy_name}`);

  // ========== DEMO TRADES ==========
  const trades = [
    // Scalper wins and losses
    {
      userId: user.id,
      pair: 'EUR/USD',
      direction: 'LONG',
      strategy_id: scalperStrategy.id,
      entry_model_id: scalperAggressiveModel.id,
      test_mode: 'live_simulation',
      planned_entry: 1.0850,
      planned_sl: 1.0845,
      planned_tp: 1.0875,
      planned_rr: 2.0,
      entryPrice: 1.0850,
      exitPrice: 1.0875,
      entryTime: new Date('2026-01-06 08:15:00'),
      exitTime: new Date('2026-01-06 08:35:00'),
      duration_minutes: 20,
      volume: 1.0,
      stopLoss: 1.0845,
      takeProfit: 1.0875,
      riskAmount: 50,
      riskPercent: 1.0,
      riskRewardRatio: 2.0,
      outcome: 'WIN',
      status: 'closed',
      profitLoss: 100,
      profitLossPercent: 2.0,
      emotionalState: 'focused',
      setupQuality: 5,
      rules_followed: true,
      session: 'London',
      market_condition: 'trending',
      notes: 'Clean break above 1.0850 resistance with strong momentum',
    },
    {
      userId: user.id,
      pair: 'GBP/USD',
      direction: 'SHORT',
      strategy_id: scalperStrategy.id,
      entry_model_id: scalperBalancedModel.id,
      test_mode: 'live_simulation',
      planned_entry: 1.2650,
      planned_sl: 1.2665,
      planned_tp: 1.2625,
      planned_rr: 1.67,
      entryPrice: 1.2650,
      exitPrice: 1.2665,
      entryTime: new Date('2026-01-06 14:20:00'),
      exitTime: new Date('2026-01-06 14:45:00'),
      duration_minutes: 25,
      volume: 1.0,
      stopLoss: 1.2665,
      takeProfit: 1.2625,
      riskAmount: 50,
      riskPercent: 1.0,
      riskRewardRatio: 1.67,
      outcome: 'LOSS',
      status: 'closed',
      profitLoss: -50,
      profitLossPercent: -1.0,
      emotionalState: 'rushed',
      setupQuality: 2,
      rules_followed: false,
      session: 'London',
      market_condition: 'choppy',
      notes: 'Entered without proper M15 confirmation, hit SL quickly',
    },
    // Swing trades
    {
      userId: user.id,
      pair: 'USD/JPY',
      direction: 'LONG',
      strategy_id: swingStrategy.id,
      entry_model_id: swingBalancedModel.id,
      test_mode: 'live_simulation',
      planned_entry: 145.50,
      planned_sl: 145.00,
      planned_tp: 146.50,
      planned_rr: 2.0,
      entryPrice: 145.50,
      exitPrice: 146.50,
      entryTime: new Date('2026-01-02 10:00:00'),
      exitTime: new Date('2026-01-05 15:30:00'),
      duration_minutes: 4290,
      volume: 0.5,
      stopLoss: 145.00,
      takeProfit: 146.50,
      riskAmount: 250,
      riskPercent: 2.0,
      riskRewardRatio: 2.0,
      outcome: 'WIN',
      status: 'closed',
      profitLoss: 500,
      profitLossPercent: 2.0,
      emotionalState: 'confident',
      setupQuality: 4,
      rules_followed: true,
      session: 'Asia',
      market_condition: 'trending',
      notes: 'Perfect pullback to 0.618 Fib, held for 3 days',
    },
    {
      userId: user.id,
      pair: 'EUR/GBP',
      direction: 'SHORT',
      strategy_id: swingStrategy.id,
      entry_model_id: swingBalancedModel.id,
      test_mode: 'live_simulation',
      planned_entry: 0.8350,
      planned_sl: 0.8380,
      planned_tp: 0.8250,
      planned_rr: 2.0,
      entryPrice: 0.8350,
      exitPrice: 0.8240,
      entryTime: new Date('2026-01-03 12:00:00'),
      exitTime: new Date('2026-01-07 11:00:00'),
      duration_minutes: 5940,
      volume: 0.5,
      stopLoss: 0.8380,
      takeProfit: 0.8250,
      riskAmount: 250,
      riskPercent: 2.0,
      riskRewardRatio: 2.2,
      outcome: 'WIN',
      status: 'closed',
      profitLoss: 550,
      profitLossPercent: 2.2,
      emotionalState: 'calm',
      setupQuality: 5,
      rules_followed: true,
      session: 'London',
      market_condition: 'trending',
      notes: 'Strong downtrend confirmed on W1, excellent entry',
    },
    // Position trades
    {
      userId: user.id,
      pair: 'NZD/USD',
      direction: 'LONG',
      strategy_id: positionStrategy.id,
      entry_model_id: positionConservativeModel.id,
      test_mode: 'live_simulation',
      planned_entry: 0.6050,
      planned_sl: 0.5950,
      planned_tp: 0.6350,
      planned_rr: 3.0,
      entryPrice: 0.6050,
      exitPrice: 0.6350,
      entryTime: new Date('2025-12-20 08:00:00'),
      exitTime: new Date('2026-01-07 16:00:00'),
      duration_minutes: 31680,
      volume: 0.3,
      stopLoss: 0.5950,
      takeProfit: 0.6350,
      riskAmount: 300,
      riskPercent: 1.5,
      riskRewardRatio: 3.0,
      outcome: 'WIN',
      status: 'closed',
      profitLoss: 900,
      profitLossPercent: 3.0,
      emotionalState: 'confident',
      setupQuality: 5,
      rules_followed: true,
      session: 'Asia',
      market_condition: 'trending',
      notes: 'Clean uptrend on W1, held for 18 days, textbook execution',
    },
    {
      userId: user.id,
      pair: 'AUD/USD',
      direction: 'SHORT',
      strategy_id: positionStrategy.id,
      entry_model_id: positionConservativeModel.id,
      test_mode: 'live_simulation',
      planned_entry: 0.6550,
      planned_sl: 0.6650,
      planned_tp: 0.6350,
      planned_rr: 2.0,
      entryPrice: 0.6550,
      exitPrice: 0.6650,
      entryTime: new Date('2026-01-01 10:00:00'),
      exitTime: new Date('2026-01-04 15:00:00'),
      duration_minutes: 2940,
      volume: 0.3,
      stopLoss: 0.6650,
      takeProfit: 0.6350,
      riskAmount: 300,
      riskPercent: 1.5,
      riskRewardRatio: 2.0,
      entryPrice: 0.6550,
      exitPrice: 0.6650,
      outcome: 'LOSS',
      status: 'closed',
      profitLoss: -300,
      profitLossPercent: -1.5,
      emotionalState: 'frustrated',
      setupQuality: 2,
      rules_followed: false,
      session: 'NY',
      market_condition: 'choppy',
      notes: 'Entered without W1 confirmation, false breakout trapped me',
    },
  ];

  const createdTrades = [];
  for (const trade of trades) {
    const created = await prisma.trade.create({
      data: trade,
    });
    createdTrades.push(created);
  }

  console.log(`✅ Created ${createdTrades.length} demo trades`);

  // ========== TRADE TIMEFRAME COMPLIANCE ==========
  // For the first scalper trade, record full compliance
  if (createdTrades[0]) {
    const scalperTradeCompliance = [
      { timeframe: 'H1', role_type: 'bias', respected: true, notes: 'Uptrend confirmed on H1' },
      { timeframe: 'M15', role_type: 'structure', respected: true, notes: 'Support/resistance clear' },
      { timeframe: 'M5', role_type: 'entry', respected: true, notes: 'Perfect entry signal' },
      { timeframe: 'M1', role_type: 'execution', respected: true, notes: 'Smooth execution' },
    ];

    for (const compliance of scalperTradeCompliance) {
      await prisma.tradeTimeframeCompliance.create({
        data: {
          trade_id: createdTrades[0].id,
          ...compliance,
        },
      });
    }
  }

  // For the second scalper trade (loss), record non-compliance on M15
  if (createdTrades[1]) {
    const scalperLossCompliance = [
      { timeframe: 'H1', role_type: 'bias', respected: true, notes: 'Slight downtrend' },
      { timeframe: 'M15', role_type: 'structure', respected: false, notes: 'VIOLATED: Entered without proper structure on M15' },
      { timeframe: 'M5', role_type: 'entry', respected: true, notes: 'Entry signal present' },
      { timeframe: 'M1', role_type: 'execution', respected: true, notes: 'Execution ok' },
    ];

    for (const compliance of scalperLossCompliance) {
      await prisma.tradeTimeframeCompliance.create({
        data: {
          trade_id: createdTrades[1].id,
          ...compliance,
        },
      });
    }
  }

  console.log(`✅ Added timeframe compliance records`);

  // ========== TRADE RULE COMPLIANCE ==========
  // For winning trades, mark all rules as followed
  if (createdTrades[0]) {
    for (const rule of createdScalperRules) {
      await prisma.tradeRuleCompliance.create({
        data: {
          trade_id: createdTrades[0].id,
          rule_id: rule.id,
          followed: true,
          notes: 'Rule respected during trade',
        },
      });
    }
  }

  // For losing trades, mark rule violations
  if (createdTrades[1]) {
    for (let i = 0; i < createdScalperRules.length; i++) {
      const rule = createdScalperRules[i];
      const violated = i === 1; // Violated the second rule (London hours)
      await prisma.tradeRuleCompliance.create({
        data: {
          trade_id: createdTrades[1].id,
          rule_id: rule.id,
          followed: !violated,
          notes: violated ? 'VIOLATED: Traded outside London hours' : 'Rule respected',
        },
      });
    }
  }

  // For swing trade wins
  if (createdTrades[2]) {
    for (const rule of createdSwingRules) {
      await prisma.tradeRuleCompliance.create({
        data: {
          trade_id: createdTrades[2].id,
          rule_id: rule.id,
          followed: true,
          notes: 'Excellent rule adherence',
        },
      });
    }
  }

  // For position trade loss
  if (createdTrades[4]) {
    for (let i = 0; i < createdPositionRules.length; i++) {
      const rule = createdPositionRules[i];
      const violated = i === 0; // Violated the first rule (W1 trend)
      await prisma.tradeRuleCompliance.create({
        data: {
          trade_id: createdTrades[4].id,
          rule_id: rule.id,
          followed: !violated,
          notes: violated ? 'VIOLATED: Did not wait for W1 confirmation' : 'Rule respected',
        },
      });
    }
  }

  console.log(`✅ Added rule compliance records`);

  console.log('🎉 Seed complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
