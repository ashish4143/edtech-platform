import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Role } from '@prisma/client';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q')?.trim() || '';

    const students = await prisma.user.findMany({
      where: {
        role: Role.Student,
        ...(q ? { name: { contains: q, mode: 'insensitive' } } : {}),
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        grade: true,
        board: true,
        createdAt: true,
        batchEnrollments: {
          select: { batch: { select: { name: true, grade: true } } },
          take: 1,
        },
      },
      orderBy: { name: 'asc' },
      take: 20,
    });

    return NextResponse.json({ students });
  } catch (error: any) {
    console.error('Failed to fetch students list:', error);
    return NextResponse.json({ error: 'Failed to fetch registered students database' }, { status: 500 });
  }
}
