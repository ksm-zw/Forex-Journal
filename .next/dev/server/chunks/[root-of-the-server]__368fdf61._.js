module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[project]/src/lib/prisma.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "prisma",
    ()=>prisma
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f40$prisma$2f$client$29$__ = __turbopack_context__.i("[externals]/@prisma/client [external] (@prisma/client, cjs, [project]/node_modules/@prisma/client)");
;
// Safe Prisma provider: only instantiate Prisma when DATABASE_URL looks valid for supported providers.
// This prevents dev servers and serverless hosts without DB configured from crashing.
let prisma = null;
try {
    const url = process.env.DATABASE_URL || '';
    const normalized = url.trim();
    const isSqlite = normalized.startsWith('file:');
    const isPg = normalized.startsWith('postgres') || normalized.startsWith('postgresql:');
    if (normalized && (isSqlite || isPg)) {
        prisma = new __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f40$prisma$2f$client$29$__["PrismaClient"]();
    } else {
        // No valid DATABASE_URL set; leave prisma null so callers can fallback
        console.warn('Prisma disabled: DATABASE_URL not set to sqlite or postgres. Falling back to demo/resilient behavior.');
    }
} catch (err) {
    console.warn('Failed to initialize Prisma client:', err);
    prisma = null;
}
;
}),
"[project]/src/lib/analytics.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Analytics Utilities for Forex Trading Research Lab
 * Calculate metrics, analyze patterns, and generate insights from trade data
 */ __turbopack_context__.s([
    "calculateMetricsByStrategy",
    ()=>calculateMetricsByStrategy,
    "calculateRuleViolationImpact",
    ()=>calculateRuleViolationImpact,
    "generateRuleBasedSummary",
    ()=>generateRuleBasedSummary,
    "groupTradesByPeriod",
    ()=>groupTradesByPeriod,
    "periodMetrics",
    ()=>periodMetrics,
    "timeframeSequenceAnalysis",
    ()=>timeframeSequenceAnalysis
]);
function calculateMetricsByStrategy(trades) {
    if (!trades.length) {
        return {
            totalTrades: 0,
            closedTrades: 0,
            wins: 0,
            losses: 0,
            breakeven: 0,
            winRate: 0,
            totalRR: 0,
            avgWin: 0,
            avgLoss: 0,
            expectancy: 0,
            profitFactor: 0
        };
    }
    const closed = trades.filter((t)=>t.status === 'closed');
    const wins = closed.filter((t)=>t.outcome === 'WIN');
    const losses = closed.filter((t)=>t.outcome === 'LOSS');
    const breakeven = closed.filter((t)=>t.outcome === 'BREAKEVEN');
    const totalRR = trades.reduce((sum, t)=>sum + (t.riskRewardRatio || 0), 0);
    const totalWinRR = wins.reduce((sum, t)=>sum + (t.riskRewardRatio || 0), 0);
    const totalLossAmount = Math.abs(losses.reduce((sum, t)=>sum + (t.profitLoss || 0), 0));
    const winRate = closed.length > 0 ? wins.length / closed.length * 100 : 0;
    const avgWin = wins.length > 0 ? totalWinRR / wins.length : 0;
    const avgLoss = losses.length > 0 ? totalLossAmount / losses.length * -1 : 0;
    const profitFactor = Math.abs(avgLoss) > 0 ? avgWin / Math.abs(avgLoss) : 0;
    const expectancy = wins.length > 0 && losses.length > 0 ? (wins.length * avgWin - losses.length * Math.abs(avgLoss)) / (wins.length + losses.length) : 0;
    return {
        totalTrades: trades.length,
        closedTrades: closed.length,
        wins: wins.length,
        losses: losses.length,
        breakeven: breakeven.length,
        winRate: parseFloat(winRate.toFixed(2)),
        totalRR: parseFloat(totalRR.toFixed(2)),
        avgWin: parseFloat(avgWin.toFixed(2)),
        avgLoss: parseFloat(avgLoss.toFixed(2)),
        expectancy: parseFloat(expectancy.toFixed(2)),
        profitFactor: parseFloat(profitFactor.toFixed(2))
    };
}
function calculateRuleViolationImpact(trades, tradeRuleCompliance) {
    let hypotheticalPL = 0;
    let actualPL = 0;
    const ruleViolationCounts = {};
    const ruleViolationPL = {};
    for (const trade of trades){
        actualPL += trade.profitLoss || 0;
        const violations = tradeRuleCompliance.filter((c)=>c.trade_id === trade.id && !c.followed);
        if (violations.length === 0) {
            hypotheticalPL += trade.profitLoss || 0;
        }
        for (const violation of violations){
            const ruleId = violation.rule_id;
            ruleViolationCounts[ruleId] = (ruleViolationCounts[ruleId] || 0) + 1;
            ruleViolationPL[ruleId] = (ruleViolationPL[ruleId] || 0) + (trade.profitLoss || 0);
        }
    }
    return {
        actualPL: parseFloat(actualPL.toFixed(2)),
        hypotheticalPL: parseFloat(hypotheticalPL.toFixed(2)),
        impactFromViolations: parseFloat((actualPL - hypotheticalPL).toFixed(2)),
        ruleViolationCounts,
        ruleViolationPL
    };
}
function groupTradesByPeriod(trades, periodType) {
    const groups = {};
    for (const trade of trades){
        const date = new Date(trade.entryTime);
        let key;
        switch(periodType){
            case 'day':
                key = date.toISOString().split('T')[0];
                break;
            case 'week':
                const weekStart = new Date(date);
                weekStart.setDate(date.getDate() - date.getDay());
                key = weekStart.toISOString().split('T')[0];
                break;
            case 'month':
                key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                break;
            case 'quarter':
                const quarter = Math.ceil((date.getMonth() + 1) / 3);
                key = `${date.getFullYear()}-Q${quarter}`;
                break;
            case 'half':
                const half = date.getMonth() < 6 ? 'H1' : 'H2';
                key = `${date.getFullYear()}-${half}`;
                break;
            case 'year':
                key = String(date.getFullYear());
                break;
        }
        if (!groups[key]) {
            groups[key] = [];
        }
        groups[key].push(trade);
    }
    return groups;
}
function periodMetrics(trades) {
    const metrics = calculateMetricsByStrategy(trades);
    return {
        period: {
            startDate: trades.length > 0 ? trades[0].entryTime : null,
            endDate: trades.length > 0 ? trades[trades.length - 1].entryTime : null
        },
        ...metrics
    };
}
function timeframeSequenceAnalysis(trades, timeframeCompliance) {
    const sequences = {};
    for (const trade of trades){
        const compliance = timeframeCompliance.filter((c)=>c.trade_id === trade.id);
        const sequence = compliance.map((c)=>c.role_type).join('→') || 'unknown';
        if (!sequences[sequence]) {
            sequences[sequence] = [];
        }
        sequences[sequence].push(trade);
    }
    const analysis = {};
    for (const [sequence, sequenceTrades] of Object.entries(sequences)){
        analysis[sequence] = calculateMetricsByStrategy(sequenceTrades);
    }
    return analysis;
}
function generateRuleBasedSummary(metrics, strategies, tradeData) {
    const insights = [];
    // Win rate analysis
    if (metrics.winRate > 60) {
        insights.push(`Excellent win rate of ${metrics.winRate}% — focus on consistency and maintaining edge.`);
    } else if (metrics.winRate < 30) {
        insights.push(`Win rate is ${metrics.winRate}% — review entry logic and rule adherence.`);
    }
    // Expectancy analysis
    if (metrics.expectancy > 1.0) {
        insights.push(`Positive expectancy of ${metrics.expectancy}R per trade — the strategy is profitable.`);
    } else if (metrics.expectancy < 0) {
        insights.push(`Negative expectancy of ${metrics.expectancy}R — strategy needs refinement.`);
    }
    // Rule adherence
    if (tradeData.ruleViolationImpact) {
        const impact = tradeData.ruleViolationImpact.impactFromViolations;
        if (impact < 0) {
            insights.push(`Rule violations cost you ${Math.abs(impact).toFixed(2)}R — stricter discipline needed.`);
        }
    }
    return {
        narrative: insights.join(' '),
        feedback: {
            stop: [],
            continue: [],
            experiment: []
        }
    };
}
}),
"[project]/src/app/api/summaries/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET,
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/prisma.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$analytics$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/analytics.ts [app-route] (ecmascript)");
;
;
;
async function POST(request) {
    try {
        const userIdentifier = request.headers.get('x-user-id') || 'demo@forex-research.com';
        const body = await request.json();
        const { period_type = 'month', start_date, end_date } = body;
        if (!__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"]) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Database not available'
            }, {
                status: 503
            });
        }
        let user = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].user.findUnique({
            where: {
                email: userIdentifier
            }
        });
        if (!user) {
            user = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].user.findUnique({
                where: {
                    id: userIdentifier
                }
            });
        }
        if (!user) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'User not found'
            }, {
                status: 404
            });
        }
        const trades = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].trade.findMany({
            where: {
                userId: user.id
            },
            include: {
                rule_compliance: true,
                strategy: true
            }
        });
        const summary = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$analytics$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["generateRuleBasedSummary"])({
            totalTrades: trades.length,
            closedTrades: trades.filter((t)=>t.exitPrice).length,
            wins: trades.filter((t)=>t.exitPrice && t.exitPrice > t.entryPrice).length,
            losses: trades.filter((t)=>t.exitPrice && t.exitPrice < t.entryPrice).length,
            winRate: 0,
            totalRR: 0,
            expectancy: 0,
            profitFactor: 0
        }, await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].strategy.findMany({
            where: {
                userId: user.id
            }
        }), trades);
        const storedSummary = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].summary.create({
            data: {
                userId: user.id,
                period_type,
                start_date: start_date ? new Date(start_date) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                end_date: end_date ? new Date(end_date) : new Date(),
                summary_mode: 'rule_based',
                content: JSON.stringify(summary),
                feedback_actions: JSON.stringify([])
            }
        });
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true,
            summary: storedSummary
        });
    } catch (error) {
        console.error('Error generating summary:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'Failed to generate summary'
        }, {
            status: 500
        });
    }
}
async function GET(request) {
    try {
        const userIdentifier = request.headers.get('x-user-id') || 'demo@forex-research.com';
        if (!__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"]) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Database not available'
            }, {
                status: 503
            });
        }
        let user = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].user.findUnique({
            where: {
                email: userIdentifier
            }
        });
        if (!user) {
            user = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].user.findUnique({
                where: {
                    id: userIdentifier
                }
            });
        }
        if (!user) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'User not found'
            }, {
                status: 404
            });
        }
        const summaries = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].summary.findMany({
            where: {
                userId: user.id
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true,
            summaries
        });
    } catch (error) {
        console.error('Error fetching summaries:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'Failed to fetch summaries'
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__368fdf61._.js.map