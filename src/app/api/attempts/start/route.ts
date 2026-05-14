import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { AttemptStatus, Role } from '@prisma/client';
import { getServerSession } from 'next-auth';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required to start a test attempt' }, { status: 401 });
    }

    if (session.user.role !== Role.Student) {
      return NextResponse.json({ error: 'Only student accounts can start test attempts' }, { status: 403 });
    }

    const body = await request.json();
    const { testId } = body;
    const studentId = session.user.id;

    if (!testId) {
      return NextResponse.json({ error: 'Missing testId' }, { status: 400 });
    }

    // Verify test exists
    const test = await prisma.test.findUnique({
      where: { id: testId },
      include: {
        questions: {
          include: {
            question: {
              select: {
                id: true,
                content: true,
                options: true,
                type: true,
                // Exclude correctAnswer for security during test delivery
              },
            },
          },
          orderBy: { orderIndex: 'asc' },
        },
      },
    });

    if (!test) {
      return NextResponse.json({ error: 'Test not found' }, { status: 404 });
    }

    // Check for an existing attempt to prevent restarting submitted tests.
    let activeAttempt = await prisma.attempt.findFirst({
      where: {
        testId,
        studentId,
      },
      orderBy: { startTime: 'desc' },
    });

    if (activeAttempt && activeAttempt.status !== AttemptStatus.In_Progress) {
      return NextResponse.json(
        { error: 'This test has already been submitted by the authenticated student' },
        { status: 409 }
      );
    }

    if (!activeAttempt) {
      activeAttempt = await prisma.attempt.create({
        data: {
          testId,
          studentId,
          status: AttemptStatus.In_Progress,
        },
      });
    }

    return NextResponse.json({
      message: 'Attempt initialized successfully',
      attemptId: activeAttempt.id,
      startTime: activeAttempt.startTime,
      durationMins: test.durationMins,
      testDetails: {
        title: test.title,
        board: test.board,
        grade: test.grade,
        subject: test.subject,
        totalMarks: test.totalMarks,
        questionsList: test.questions,
      },
    }, { status: 201 });
  } catch (error: any) {
    console.error('Start attempt error:', error);
    return NextResponse.json({ error: 'Failed to initialize test attempt' }, { status: 500 });
  }
}
