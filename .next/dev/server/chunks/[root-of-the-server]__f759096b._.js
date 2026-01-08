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
"[externals]/fs [external] (fs, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("fs", () => require("fs"));

module.exports = mod;
}),
"[externals]/path [external] (path, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("path", () => require("path"));

module.exports = mod;
}),
"[project]/src/app/api/trades/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET,
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f40$prisma$2f$client$29$__ = __turbopack_context__.i("[externals]/@prisma/client [external] (@prisma/client, cjs, [project]/node_modules/@prisma/client)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/fs [external] (fs, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/path [external] (path, cjs)");
;
;
;
;
let prisma = null;
try {
    prisma = new __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f40$prisma$2f$client$29$__["PrismaClient"]();
} catch (e) {
    console.warn('Prisma client failed to initialize', e);
    prisma = null;
}
function loadDemoTrades() {
    const possible = [
        __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(process.cwd(), 'data', 'demo-trades.json'),
        __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(process.cwd(), 'src', 'data', 'demo-trades.json'),
        __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(process.cwd(), 'public', 'data', 'demo-trades.json')
    ];
    for (const p of possible){
        try {
            const raw = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["readFileSync"])(p, 'utf-8');
            return JSON.parse(raw);
        } catch (e) {
        // try next
        }
    }
    console.error('Failed to load demo trades file from known locations');
    return [];
}
async function GET(request) {
    const userId = request.headers.get('x-user-id') || 'demo-user';
    try {
        const { searchParams } = new URL(request.url);
        const pair = searchParams.get('pair');
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');
        const outcome = searchParams.get('outcome');
        const status = searchParams.get('status');
        const account = searchParams.get('account');
        const strategy = searchParams.get('strategy');
        const where = {
            userId
        };
        if (pair) where.pair = pair;
        if (outcome) where.outcome = outcome;
        if (status) where.status = status;
        if (account) where.account = account;
        if (strategy) where.strategy = strategy;
        if (startDate || endDate) {
            where.entryTime = {};
            if (startDate) where.entryTime.gte = new Date(startDate);
            if (endDate) where.entryTime.lte = new Date(endDate);
        }
        if (!prisma) {
            console.warn('Prisma not available, returning demo trades');
            // Optionally, apply filters on demo data
            const demoAll = loadDemoTrades();
            const demo = demoAll.filter((t)=>t.userId === userId || !t.userId).slice(0, 100);
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(demo);
        }
        const trades = await prisma.trade.findMany({
            where,
            orderBy: {
                entryTime: 'desc'
            },
            include: {
                screenshots: true,
                voiceNotes: true
            }
        });
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(trades);
    } catch (error) {
        console.error('Error fetching trades:', error);
        // On error, fall back to demo data so the frontend remains usable
        const demoAll = loadDemoTrades();
        const demo = demoAll.filter((t)=>t.userId === userId || !t.userId).slice(0, 100);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(demo);
    }
}
async function POST(request) {
    try {
        const userId = request.headers.get('x-user-id') || 'demo-user';
        const body = await request.json();
        if (!prisma) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Prisma not available'
            }, {
                status: 503
            });
        }
        const trade = await prisma.trade.create({
            data: {
                userId,
                pair: body.pair,
                direction: body.direction,
                entryPrice: parseFloat(body.entryPrice),
                exitPrice: body.exitPrice ? parseFloat(body.exitPrice) : null,
                entryTime: new Date(body.entryTime),
                exitTime: body.exitTime ? new Date(body.exitTime) : null,
                volume: parseFloat(body.volume || 0),
                stopLoss: body.stopLoss ? parseFloat(body.stopLoss) : null,
                takeProfit: body.takeProfit ? parseFloat(body.takeProfit) : null,
                riskAmount: body.riskAmount ? parseFloat(body.riskAmount) : null,
                riskPercent: body.riskPercent ? parseFloat(body.riskPercent) : null,
                riskRewardRatio: body.riskRewardRatio ? parseFloat(body.riskRewardRatio) : null,
                account: body.account,
                broker: body.broker,
                accountBalance: body.accountBalance ? parseFloat(body.accountBalance) : null,
                accountEquity: body.accountEquity ? parseFloat(body.accountEquity) : null,
                profitLoss: body.profitLoss ? parseFloat(body.profitLoss) : null,
                profitLossPercent: body.profitLossPercent ? parseFloat(body.profitLossPercent) : null,
                outcome: body.outcome,
                status: body.status || 'open',
                strategy: body.strategy,
                setupType: body.setupType,
                notes: body.notes,
                emotionalState: body.emotionalState,
                setupQuality: body.setupQuality ? parseInt(body.setupQuality) : null,
                whatLearned: body.whatLearned,
                mistakes: body.mistakes ? JSON.stringify(body.mistakes) : null
            },
            include: {
                screenshots: true,
                voiceNotes: true
            }
        });
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(trade, {
            status: 201
        });
    } catch (error) {
        console.error('Error creating trade:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'Failed to create trade'
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__f759096b._.js.map