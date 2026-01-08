import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = request.headers.get('x-user-id') || 'demo@forex-research.com';
    const { id: roleId } = await params;
    const body = await request.json();

    if (!prisma) return NextResponse.json({ error: 'Database not available' }, { status: 503 });

    const role = await prisma.timeframeRole.findFirst({
      where: { id: roleId, strategy: { userId } },
    });
    if (!role) return NextResponse.json({ error: 'Timeframe role not found' }, { status: 404 });

    const updated = await prisma.timeframeRole.update({
      where: { id: roleId },
      data: {
        timeframe: body.timeframe ?? role.timeframe,
        role_type: body.role_type ?? role.role_type,
        order_index: body.order_index ?? role.order_index,
      },
    });

    return NextResponse.json({ success: true, role: updated });
  } catch (error) {
    console.error('Error updating timeframe role:', error);
    return NextResponse.json({ error: 'Failed to update timeframe role' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = request.headers.get('x-user-id') || 'demo@forex-research.com';
    const { id: roleId } = await params;

    if (!prisma) return NextResponse.json({ error: 'Database not available' }, { status: 503 });

    const role = await prisma.timeframeRole.findFirst({
      where: { id: roleId, strategy: { userId } },
    });
    if (!role) return NextResponse.json({ error: 'Timeframe role not found' }, { status: 404 });

    await prisma.timeframeRole.delete({ where: { id: roleId } });
    return NextResponse.json({ success: true, message: 'Timeframe role deleted' });
  } catch (error) {
    console.error('Error deleting timeframe role:', error);
    return NextResponse.json({ error: 'Failed to delete timeframe role' }, { status: 500 });
  }
}
