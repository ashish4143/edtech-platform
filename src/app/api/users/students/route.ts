import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Role } from '@prisma/client';

export async function GET() {
  try {
    const students = await prisma.user.findMany({
      where: { role: Role.Student },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        grade: true,
        board: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ students });
  } catch (error: any) {
    console.error('Failed to fetch students list:', error);
    return NextResponse.json({ error: 'Failed to fetch registered students database' }, { status: 500 });
  }
}
