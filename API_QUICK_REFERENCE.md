# Quick Reference - Research Lab API

## Base URL
```
http://localhost:3000/api
```

## Headers (All Requests)
```
x-user-id: demo@forex-research.com
```

---

## Strategies

### List Strategies
```bash
GET /strategies
Response: { success: true, strategies: [...] }
```

### Get Strategy Detail
```bash
GET /strategies/{id}
Response: { success: true, strategy: {...} }
```

### Create Strategy
```bash
POST /strategies
{
  "strategy_name": "My Strategy",
  "description": "...",
  "market_type": "trend|mean_reversion|mixed",
  "allowed_sessions": "London,NY",
  "default_risk_percent": 1.5,
  "expected_rr_min": 2
}
```

### Update Strategy
```bash
PUT /strategies/{id}
{
  "strategy_name": "Updated Name",
  ...
}
```

### Delete Strategy
```bash
DELETE /strategies/{id}
```

---

## Entry Models

### List Entry Models
```bash
GET /strategies/{id}/entry-models
```

### Create Entry Model
```bash
POST /strategies/{id}/entry-models
{
  "model_name": "Conservative",
  "confirmation_type": "multiple_timeframes",
  "risk_profile": "low"
}
```

---

## Timeframe Roles

### List Timeframe Roles
```bash
GET /strategies/{id}/timeframe-roles
```

### Create Timeframe Role
```bash
POST /strategies/{id}/timeframe-roles
{
  "timeframe": "H4",
  "role_type": "bias|structure|poi|confirmation|entry|execution",
  "order_index": 0
}
```

---

## Strategy Rules

### List Rules
```bash
GET /strategies/{id}/rules
```

### Create Rule
```bash
POST /strategies/{id}/rules
{
  "description": "Only trade during NY session",
  "rule_type": "mandatory|optional",
  "weight": 2
}
```

---

## Trade Compliance

### Get Timeframe Compliance
```bash
GET /trades/{tradeId}/timeframe-compliance
Response: { records: [...] }
```

### Record Timeframe Compliance
```bash
POST /trades/{tradeId}/timeframe-compliance
{
  "timeframe": "H4",
  "role_type": "bias",
  "respected": true,
  "notes": "Trend clear on H4"
}
```

### Get Rule Compliance
```bash
GET /trades/{tradeId}/rule-compliance
Response: { records: [...] }
```

### Record Rule Compliance
```bash
POST /trades/{tradeId}/rule-compliance
{
  "rule_id": "{ruleId}",
  "followed": true,
  "notes": "Traded during NY session as required"
}
```

---

## Analytics

### Strategy Comparison
```bash
GET /analytics/strategy-comparison
Response: {
  success: true,
  analysis: {
    {strategyId}: {
      name: "Strategy Name",
      totalTrades: 10,
      winRate: 55,
      expectancy: 50,
      profitFactor: 1.5,
      ruleViolationImpact: {...}
    }
  }
}
```

### Period Analysis
```bash
GET /analytics/period-analysis?period=month
?period = day|week|month|quarter|half|year

Response: {
  success: true,
  period: "month",
  analysis: {
    "2024-01": { totalTrades: 5, wins: 3, ... },
    "2024-02": { totalTrades: 8, wins: 4, ... }
  }
}
```

### Rule Violations
```bash
GET /analytics/rule-violations
Response: {
  success: true,
  summary: {
    totalTrades: 12,
    actualPL: 500,
    hypotheticalPL: 1200,
    costFromViolations: -700
  },
  ruleStatistics: {
    {ruleId}: {
      ruleName: "...",
      totalTrades: 12,
      violations: 3,
      violationRate: "25.00"
    }
  }
}
```

### Timeframe Performance
```bash
GET /analytics/timeframe-performance
Response: {
  success: true,
  sequencePerformance: [
    {
      sequence: "H4→H1→M15",
      wins: 5,
      losses: 2,
      winRate: 71.4
    }
  ]
}
```

---

## Summaries

### List Summaries
```bash
GET /summaries
Response: { success: true, summaries: [...] }
```

### Generate Summary
```bash
POST /summaries
{
  "period_type": "month",
  "start_date": "2024-01-01",
  "end_date": "2024-01-31"
}
Response: {
  success: true,
  summary: {
    id: "...",
    content: "{...JSON insights}",
    feedback_actions: "[...]"
  }
}
```

---

## Error Responses

### 400 - Bad Request
```json
{ "error": "Missing strategy_name" }
```

### 404 - Not Found
```json
{ "error": "User not found" }
```

### 500 - Server Error
```json
{ "error": "Failed to fetch strategies" }
```

### 503 - Service Unavailable
```json
{ "error": "Database not available" }
```

---

## Common Workflows

### Create and Test a Strategy

```bash
# 1. Create strategy
curl -X POST http://localhost:3000/api/strategies \
  -H "x-user-id: demo@forex-research.com" \
  -H "Content-Type: application/json" \
  -d '{"strategy_name":"Test","market_type":"trend","default_risk_percent":1.5}'

# 2. Add entry model
curl -X POST http://localhost:3000/api/strategies/{strategyId}/entry-models \
  -H "x-user-id: demo@forex-research.com" \
  -H "Content-Type: application/json" \
  -d '{"model_name":"Conservative","confirmation_type":"multiple_timeframes","risk_profile":"low"}'

# 3. Add rules
curl -X POST http://localhost:3000/api/strategies/{strategyId}/rules \
  -H "x-user-id: demo@forex-research.com" \
  -H "Content-Type: application/json" \
  -d '{"description":"Only trade London session","rule_type":"mandatory","weight":2}'

# 4. Analyze performance
curl http://localhost:3000/api/analytics/strategy-comparison \
  -H "x-user-id: demo@forex-research.com"
```

### Log Trade with Compliance

```bash
# 1. Update trade with planned values
curl -X PUT http://localhost:3000/api/trades/{tradeId}/compliance \
  -H "x-user-id: demo@forex-research.com" \
  -H "Content-Type: application/json" \
  -d '{"planned_entry":1.0850,"planned_sl":1.0820,"planned_tp":1.0950,"strategy_id":"{strategyId}"}'

# 2. Record timeframe compliance
curl -X POST http://localhost:3000/api/trades/{tradeId}/timeframe-compliance \
  -H "x-user-id: demo@forex-research.com" \
  -H "Content-Type: application/json" \
  -d '{"timeframe":"H4","role_type":"bias","respected":true,"notes":"Clear uptrend on H4"}'

# 3. Record rule compliance
curl -X POST http://localhost:3000/api/trades/{tradeId}/rule-compliance \
  -H "x-user-id: demo@forex-research.com" \
  -H "Content-Type: application/json" \
  -d '{"rule_id":"{ruleId}","followed":true,"notes":"Traded during London session"}'
```

---

**Last Updated:** January 8, 2026
**API Version:** v1
**Status:** Production Ready
