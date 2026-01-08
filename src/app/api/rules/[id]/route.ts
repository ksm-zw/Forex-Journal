import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = request.headers.get('x-user-id') || 'demo@forex-research.com';
    const { id: ruleId } = await params;
    const body = await request.json();

    if (!prisma) return NextResponse.json({ error: 'Database not available' }, { status: 503 });

    const rule = await prisma.strategyRule.findFirst({
      where: { id: ruleId, strategy: { userId } },
    });
    if (!rule) return NextResponse.json({ error: 'Rule not found' }, { status: 404 });

    const updated = await prisma.strategyRule.update({
      where: { id: ruleId },
      data: {
        description: body.description ?? rule.description,
        rule_type: body.rule_type ?? rule.rule_type,
        weight: body.weight ?? rule.weight,
      },
    });

    return NextResponse.json({ success: true, rule: updated });
  } catch (error) {
    console.error('Error updating rule:', error);
    return NextResponse.json({ error: 'Failed to update rule' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = request.headers.get('x-user-id') || 'demo@forex-research.com';
    const { id: ruleId } = await params;

    if (!prisma) return NextResponse.json({ error: 'Database not available' }, { status: 503 });

    const rule = await prisma.strategyRule.findFirst({
      where: { id: ruleId, strategy: { userId } },
    });
    if (!rule) return NextResponse.json({ error: 'Rule not found' }, { status: 404 });

    await prisma.strategyRule.delete({ where: { id: ruleId } });
    return NextResponse.json({ success: true, message: 'Rule deleted' });
  } catch (error) {
    console.error('Error deleting rule:', error);
    return NextResponse.json({ error: 'Failed to delete rule' }, { status: 500 });
  }
}
