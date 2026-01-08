import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = request.headers.get('x-user-id') || 'demo@forex-research.com';
    const { id: entryModelId } = await params;
    const body = await request.json();

    if (!prisma) return NextResponse.json({ error: 'Database not available' }, { status: 503 });

    const model = await prisma.entryModel.findFirst({
      where: { id: entryModelId, strategy: { userId } },
    });
    if (!model) return NextResponse.json({ error: 'Entry model not found' }, { status: 404 });

    const updated = await prisma.entryModel.update({
      where: { id: entryModelId },
      data: {
        name: body.name ?? model.name,
        confirmation_type: body.confirmation_type ?? model.confirmation_type,
        risk_profile: body.risk_profile ?? model.risk_profile,
      },
    });

    return NextResponse.json({ success: true, model: updated });
  } catch (error) {
    console.error('Error updating entry model:', error);
    return NextResponse.json({ error: 'Failed to update entry model' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = request.headers.get('x-user-id') || 'demo@forex-research.com';
    const { id: entryModelId } = await params;

    if (!prisma) return NextResponse.json({ error: 'Database not available' }, { status: 503 });

    const model = await prisma.entryModel.findFirst({
      where: { id: entryModelId, strategy: { userId } },
    });
    if (!model) return NextResponse.json({ error: 'Entry model not found' }, { status: 404 });

    await prisma.entryModel.delete({ where: { id: entryModelId } });
    return NextResponse.json({ success: true, message: 'Entry model deleted' });
  } catch (error) {
    console.error('Error deleting entry model:', error);
    return NextResponse.json({ error: 'Failed to delete entry model' }, { status: 500 });
  }
}
