import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id') || 'demo-user';
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');

    const where: any = { userId };
    if (date) {
      const targetDate = new Date(date);
      const nextDate = new Date(targetDate);
      nextDate.setDate(nextDate.getDate() + 1);
      where.date = {
        gte: targetDate,
        lt: nextDate,
      };
    }

    if (!prisma) {
      console.warn('Prisma not available for daily goals; returning empty list');
      return NextResponse.json([]);
    }

    const goals = await prisma.dailyGoal.findMany({
      where,
      orderBy: { date: 'desc' },
    });

    return NextResponse.json(goals);
  } catch (error) {
    console.error('Error fetching daily goals:', error);
    return NextResponse.json({ error: 'Failed to fetch goals' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id') || 'demo-user';
    const body = await request.json();

    if (!prisma) {
      console.warn('Prisma not available for daily goals; returning posted goal without persisting');
      return NextResponse.json({ ...body, userId }, { status: 201 });
    }

    const goal = await prisma.dailyGoal.upsert({
      where: {
        userId_date: {
          userId,
          date: new Date(body.date),
        },
      },
      update: {
        goals: body.goals ? JSON.stringify(body.goals) : undefined,
        notes: body.notes,
      },
      create: {
        userId,
        date: new Date(body.date),
        goals: body.goals ? JSON.stringify(body.goals) : '[]',
        notes: body.notes || '',
      },
    });

    return NextResponse.json(goal, { status: 201 });
  } catch (error) {
    console.error('Error creating daily goal:', error);
    return NextResponse.json({ error: 'Failed to create goal' }, { status: 500 });
  }
}
