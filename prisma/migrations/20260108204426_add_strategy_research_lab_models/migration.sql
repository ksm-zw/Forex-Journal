/*
  Warnings:

  - You are about to drop the column `quantity` on the `Trade` table. All the data in the column will be lost.
  - You are about to drop the column `strategy` on the `Trade` table. All the data in the column will be lost.
  - Added the required column `volume` to the `Trade` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "Strategy" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "strategy_name" TEXT NOT NULL,
    "description" TEXT,
    "market_type" TEXT NOT NULL DEFAULT 'mixed',
    "allowed_sessions" TEXT NOT NULL DEFAULT 'Asia,London,NY',
    "max_trades_per_day" INTEGER NOT NULL DEFAULT 5,
    "default_risk_percent" REAL NOT NULL DEFAULT 2.0,
    "expected_rr_min" REAL NOT NULL DEFAULT 1.0,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Strategy_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "EntryModel" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "strategy_id" TEXT NOT NULL,
    "model_name" TEXT NOT NULL,
    "description" TEXT,
    "confirmation_type" TEXT NOT NULL DEFAULT 'break_retest',
    "risk_profile" TEXT NOT NULL DEFAULT 'balanced',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "EntryModel_strategy_id_fkey" FOREIGN KEY ("strategy_id") REFERENCES "Strategy" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TimeframeRole" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "strategy_id" TEXT NOT NULL,
    "entry_model_id" TEXT,
    "timeframe" TEXT NOT NULL,
    "role_type" TEXT NOT NULL,
    "description" TEXT,
    "order_index" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "TimeframeRole_strategy_id_fkey" FOREIGN KEY ("strategy_id") REFERENCES "Strategy" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TimeframeRole_entry_model_id_fkey" FOREIGN KEY ("entry_model_id") REFERENCES "EntryModel" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "StrategyRule" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "strategy_id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "rule_type" TEXT NOT NULL DEFAULT 'mandatory',
    "weight" REAL NOT NULL DEFAULT 1.0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "StrategyRule_strategy_id_fkey" FOREIGN KEY ("strategy_id") REFERENCES "Strategy" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TradeTimeframeCompliance" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "trade_id" TEXT NOT NULL,
    "timeframe" TEXT NOT NULL,
    "role_type" TEXT NOT NULL,
    "respected" BOOLEAN NOT NULL,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "TradeTimeframeCompliance_trade_id_fkey" FOREIGN KEY ("trade_id") REFERENCES "Trade" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TradeRuleCompliance" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "trade_id" TEXT NOT NULL,
    "rule_id" TEXT NOT NULL,
    "followed" BOOLEAN NOT NULL,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "TradeRuleCompliance_trade_id_fkey" FOREIGN KEY ("trade_id") REFERENCES "Trade" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TradeRuleCompliance_rule_id_fkey" FOREIGN KEY ("rule_id") REFERENCES "StrategyRule" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Summary" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "period_type" TEXT NOT NULL,
    "start_date" DATETIME NOT NULL,
    "end_date" DATETIME NOT NULL,
    "summary_mode" TEXT NOT NULL DEFAULT 'rule_based',
    "content" TEXT NOT NULL,
    "feedback_actions" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Summary_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Trade" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "strategy_id" TEXT,
    "entry_model_id" TEXT,
    "timeframe_sequence_id" TEXT,
    "test_mode" TEXT NOT NULL DEFAULT 'live_simulation',
    "planned_entry" REAL,
    "planned_sl" REAL,
    "planned_tp" REAL,
    "planned_rr" REAL,
    "pair" TEXT NOT NULL,
    "direction" TEXT NOT NULL,
    "entryPrice" REAL NOT NULL,
    "exitPrice" REAL,
    "entryTime" DATETIME NOT NULL,
    "exitTime" DATETIME,
    "duration_minutes" INTEGER,
    "volume" REAL NOT NULL,
    "stopLoss" REAL,
    "takeProfit" REAL,
    "riskAmount" REAL,
    "riskPercent" REAL,
    "riskRewardRatio" REAL,
    "account" TEXT,
    "broker" TEXT,
    "accountBalance" REAL,
    "accountEquity" REAL,
    "profitLoss" REAL,
    "profitLossPercent" REAL,
    "outcome" TEXT,
    "result" TEXT,
    "status" TEXT NOT NULL DEFAULT 'open',
    "strategy_old" TEXT,
    "setupType" TEXT,
    "session" TEXT,
    "market_condition" TEXT,
    "rules_followed" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "emotionalState" TEXT,
    "setupQuality" INTEGER,
    "whatLearned" TEXT,
    "mistakes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Trade_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Trade_strategy_id_fkey" FOREIGN KEY ("strategy_id") REFERENCES "Strategy" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Trade_entry_model_id_fkey" FOREIGN KEY ("entry_model_id") REFERENCES "EntryModel" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Trade" ("createdAt", "direction", "emotionalState", "entryPrice", "entryTime", "exitPrice", "exitTime", "id", "mistakes", "notes", "outcome", "pair", "profitLoss", "profitLossPercent", "riskRewardRatio", "setupQuality", "updatedAt", "userId", "whatLearned") SELECT "createdAt", "direction", "emotionalState", "entryPrice", "entryTime", "exitPrice", "exitTime", "id", "mistakes", "notes", "outcome", "pair", "profitLoss", "profitLossPercent", "riskRewardRatio", "setupQuality", "updatedAt", "userId", "whatLearned" FROM "Trade";
DROP TABLE "Trade";
ALTER TABLE "new_Trade" RENAME TO "Trade";
CREATE INDEX "Trade_userId_idx" ON "Trade"("userId");
CREATE INDEX "Trade_strategy_id_idx" ON "Trade"("strategy_id");
CREATE INDEX "Trade_entry_model_id_idx" ON "Trade"("entry_model_id");
CREATE INDEX "Trade_pair_idx" ON "Trade"("pair");
CREATE INDEX "Trade_entryTime_idx" ON "Trade"("entryTime");
CREATE INDEX "Trade_outcome_idx" ON "Trade"("outcome");
CREATE INDEX "Trade_status_idx" ON "Trade"("status");
CREATE INDEX "Trade_account_idx" ON "Trade"("account");
CREATE INDEX "Trade_test_mode_idx" ON "Trade"("test_mode");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "Strategy_userId_idx" ON "Strategy"("userId");

-- CreateIndex
CREATE INDEX "Strategy_status_idx" ON "Strategy"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Strategy_userId_strategy_name_key" ON "Strategy"("userId", "strategy_name");

-- CreateIndex
CREATE INDEX "EntryModel_strategy_id_idx" ON "EntryModel"("strategy_id");

-- CreateIndex
CREATE UNIQUE INDEX "EntryModel_strategy_id_model_name_key" ON "EntryModel"("strategy_id", "model_name");

-- CreateIndex
CREATE INDEX "TimeframeRole_strategy_id_idx" ON "TimeframeRole"("strategy_id");

-- CreateIndex
CREATE INDEX "TimeframeRole_entry_model_id_idx" ON "TimeframeRole"("entry_model_id");

-- CreateIndex
CREATE INDEX "TimeframeRole_order_index_idx" ON "TimeframeRole"("order_index");

-- CreateIndex
CREATE UNIQUE INDEX "TimeframeRole_strategy_id_entry_model_id_timeframe_role_type_key" ON "TimeframeRole"("strategy_id", "entry_model_id", "timeframe", "role_type");

-- CreateIndex
CREATE INDEX "StrategyRule_strategy_id_idx" ON "StrategyRule"("strategy_id");

-- CreateIndex
CREATE INDEX "TradeTimeframeCompliance_trade_id_idx" ON "TradeTimeframeCompliance"("trade_id");

-- CreateIndex
CREATE UNIQUE INDEX "TradeTimeframeCompliance_trade_id_timeframe_role_type_key" ON "TradeTimeframeCompliance"("trade_id", "timeframe", "role_type");

-- CreateIndex
CREATE INDEX "TradeRuleCompliance_trade_id_idx" ON "TradeRuleCompliance"("trade_id");

-- CreateIndex
CREATE INDEX "TradeRuleCompliance_rule_id_idx" ON "TradeRuleCompliance"("rule_id");

-- CreateIndex
CREATE UNIQUE INDEX "TradeRuleCompliance_trade_id_rule_id_key" ON "TradeRuleCompliance"("trade_id", "rule_id");

-- CreateIndex
CREATE INDEX "Summary_userId_idx" ON "Summary"("userId");

-- CreateIndex
CREATE INDEX "Summary_period_type_idx" ON "Summary"("period_type");

-- CreateIndex
CREATE INDEX "Summary_start_date_idx" ON "Summary"("start_date");
