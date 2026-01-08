import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculateRuleViolationImpact } from '@/lib/analytics';

export async function GET(request: NextRequest) {
  try {
    const userIdentifier = request.headers.get('x-user-id') || 'demo@forex-research.com';

    if (!prisma) {
      return NextResponse.json({ error: 'Database not available' }, { status: 503 });
    }

    let user = await prisma.user.findUnique({ where: { email: userIdentifier } });
    if (!user) user = await prisma.user.findUnique({ where: { id: userIdentifier } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const trades = await prisma.trade.findMany({
      where: { userId: user.id },
      include: {
        rule_compliance: { include: { rule: true } },
        timeframe_compliance: true,
      },
    });

    const impact = calculateRuleViolationImpact(
      trades,
      trades.flatMap((t) => t.rule_compliance)
    );

    const ruleStats: Record<string, any> = {};
    for (const trade of trades) {
      for (const compliance of trade.rule_compliance) {
        const ruleId = compliance.rule_id;
        if (!ruleStats[ruleId]) {
          ruleStats[ruleId] = {
            ruleName: compliance.rule?.description || 'Unknown',
            totalTrades: 0,
            violations: 0,
            adherence: 0,
          };
        }
        ruleStats[ruleId].totalTrades++;
        if (!compliance.followed) {
          ruleStats[ruleId].violations++;
        } else {
          ruleStats[ruleId].adherence++;
        }
      }
    }

    for (const ruleId in ruleStats) {
      const stats = ruleStats[ruleId];
      stats.violationRate = ((stats.violations / stats.totalTrades) * 100).toFixed(2);
      stats.adherenceRate = ((stats.adherence / stats.totalTrades) * 100).toFixed(2);
    }

    return NextResponse.json({
      success: true,
      summary: {
        totalTrades: trades.length,
        actualPL: impact.actualPL,
        hypotheticalPL: impact.hypotheticalPL,
        costFromViolations: impact.impactFromViolations,
      },
      ruleStatistics: ruleStats,
    });
  } catch (error) {
    console.error('Error analyzing rule violations:', error);
    return NextResponse.json({ error: 'Failed to analyze rule violations' }, { status: 500 });
  }
}
