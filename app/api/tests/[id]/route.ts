import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const allowedRoles = ['STUDENT', 'EXAMINER'];

function getOptions(value: unknown): string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string')
    ? value
    : [];
}

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: 'يلزم تسجيل الدخول.' }, { status: 401 });
  }
  if (!allowedRoles.includes(user.role)) {
    return NextResponse.json({ error: 'ليس لديك صلاحية إجراء الاختبار.' }, { status: 403 });
  }

  const { id } = await params;
  const exam = await prisma.exam.findUnique({
    where: { id },
    include: {
      questions: {
        orderBy: { order: 'asc' },
        include: { question: true },
      },
    },
  });

  if (!exam || !exam.isPublished || exam.questions.length === 0) {
    return NextResponse.json({ error: 'الاختبار غير متاح حاليًا.' }, { status: 404 });
  }

  if (exam.questions.some(({ question }) => getOptions(question.options).length < 2)) {
    console.error(`Exam ${exam.id} contains a question with invalid answer options.`);
    return NextResponse.json({ error: 'تعذر بدء الاختبار حاليًا.' }, { status: 500 });
  }

  if (exam.durationMin <= 0) {
    console.error(`Exam ${exam.id} has an invalid duration.`);
    return NextResponse.json({ error: 'تعذر بدء الاختبار حاليًا.' }, { status: 500 });
  }

  let session = await prisma.testSession.findFirst({
    where: { userId: user.id, examId: exam.id, status: 'IN_PROGRESS' },
    orderBy: { startedAt: 'desc' },
  });

  if (session && Date.now() >= session.startedAt.getTime() + exam.durationMin * 60_000) {
    await prisma.testSession.update({
      where: { id: session.id },
      data: { status: 'TIMED_OUT' },
    });
    session = null;
  }

  if (!session) {
    session = await prisma.testSession.create({
      data: { userId: user.id, examId: exam.id },
    });
  }

  return NextResponse.json({
    sessionId: session.id,
    examTitle: exam.title,
    startedAt: session.startedAt.toISOString(),
    durationMin: exam.durationMin,
    questions: exam.questions.map(({ question }) => ({
      id: question.id,
      skill: question.skill,
      level: question.cefrLevel,
      prompt: question.prompt,
      passage: question.passageText,
      audioUrl: question.audioUrl,
      options: getOptions(question.options),
    })),
  });
}
