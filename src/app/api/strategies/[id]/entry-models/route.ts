import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/strategies/[id]/entry-models
 * List entry models for a strategy
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: strategyId } = await params;
    const userId = request.headers.get('x-user-id') || 'demo-user';

    if (!prisma) {
      return NextResponse.json(
        { error: 'Database not available' },
        { status: 503 }
      );
    }

    const strategy = await prisma.strategy.findUnique({
      where: { id: strategyId },
    });

    if (!strategy || strategy.userId !== userId) {
      return NextResponse.json(
        { error: 'Strategy not found' },
        { status: 404 }
      );
    }

    const entryModels = await prisma.entryModel.findMany({
      where: { strategy_id: strategyId },
    });

    return NextResponse.json({ success: true, entryModels });
  } catch (error) {
    console.error('Error fetching entry models:', error);
    return NextResponse.json(
      { error: 'Failed to fetch entry models' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/strategies/[id]/entry-models
 * Create an entry model under a strategy
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: strategyId } = await params;
    const userId = request.headers.get('x-user-id') || 'demo-user';
    const body = await request.json();

    if (!prisma) {
      return NextResponse.json(
        { error: 'Database not available' },
        { status: 503 }
      );
    }

    const strategy = await prisma.strategy.findUnique({
      where: { id: strategyId },
    });

    if (!strategy || strategy.userId !== userId) {
      return NextResponse.json(
        { error: 'Strategy not found' },
        { status: 404 }
      );
    }

    if (!body.model_name) {
      return NextResponse.json(
        { error: 'Model name is required' },
        { status: 400 }
      );
    }

    const entryModel = await prisma.entryModel.create({
      data: {
        strategy_id: strategyId,
        model_name: body.model_name,
        description: body.description || '',
        confirmation_type: body.confirmation_type || 'break_retest',
        risk_profile: body.risk_profile || 'balanced',
      },
    });

    return NextResponse.json(
      { success: true, entryModel },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating entry model:', error);
    return NextResponse.json(
      { error: 'Failed to create entry model' },
      { status: 500 }
    );
  }
}
