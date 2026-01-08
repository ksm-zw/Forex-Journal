import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const userId = request.headers.get('x-user-id') || 'demo-user';
  
  if (!prisma) {
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
  }

  // Get all users to help debug
  const allUsers = await prisma.user.findMany();
  
  // Try to find with email
  const byEmail = await prisma.user.findUnique({
    where: { email: 'demo@forex-research.com' },
    include: { _count: { select: { strategies: true } } },
  });

  return NextResponse.json({
    headerUserId: userId,
    allUsers: allUsers.map((u) => ({ id: u.id, email: u.email })),
    demoUserByEmail: byEmail,
  });
}
