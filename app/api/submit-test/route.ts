import { randomUUID } from 'node:crypto';
import { NextResponse } from 'next/server';
import type { CEFRLevel } from '@prisma/client';
import { getSessionUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

class SubmissionConflictError extends Error {}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function isValidOptions(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

function levelForScore(score: number): CEFRLevel {
  if (score >= 90) return 'C1';
  if (score >= 80) return 'B2';
  if (score >= 70) return 'B1';
  if (score >= 60) return 'A2';
  return 'A1';
}

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ success: false, error: 'يلزم تسجيل الدخول.' }, { status: 401 });
  }
  if (user.role !== 'STUDENT' && user.role !== 'EXAMINER') {
    return NextResponse.json({ success: false, error: 'ليس لديك صلاحية تسليم الاختبار.' }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: 'صيغة الطلب غير صالحة.' }, { status: 400 });
  }

  if (
    !isRecord(body) ||
    typeof body.sessionId !== 'string' ||
    !isRecord(body.answers)
  ) {
    return NextResponse.json({ success: false, error: 'بيانات تسليم الاختبار غير صالحة.' }, { status: 400 });
  }

  const answers = body.answers;
  const session = await prisma.testSession.findFirst({
    where: {
      id: body.sessionId,
      userId: user.id,
      status: 'IN_PROGRESS',
    },
    include: {
      exam: {
        include: {
          questions: {
            orderBy: { order: 'asc' },
            include: { question: true },
          },
        },
      },
    },
  });

  if (!session || !session.exam.isPublished || session.exam.questions.length === 0) {
    return NextResponse.json(
      { success: false, error: 'جلسة الاختبار غير موجودة أو تم تسليمها مسبقًا.' },
      { status: 404 },
    );
  }

  if (Date.now() >= session.startedAt.getTime() + session.exam.durationMin * 60_000) {
    await prisma.testSession.updateMany({
      where: { id: session.id, userId: user.id, status: 'IN_PROGRESS' },
      data: { status: 'TIMED_OUT' },
    });
    return NextResponse.json(
      { success: false, error: 'انتهى وقت الاختبار ولم يتم تسليمه.' },
      { status: 410 },
    );
  }

  const questions = session.exam.questions.map(({ question }) => question);
  const questionById = new Map(questions.map((question) => [question.id, question]));
  const answerEntries = Object.entries(answers);
  if (answerEntries.length > questions.length) {
    return NextResponse.json({ success: false, error: 'تتضمن الإجابات بيانات غير صالحة.' }, { status: 400 });
  }

  for (const [questionId, answer] of answerEntries) {
    const question = questionById.get(questionId);
    if (
      !question ||
      typeof answer !== 'string' ||
      answer.length > 1000 ||
      !isValidOptions(question.options) ||
      !question.options.includes(answer)
    ) {
      return NextResponse.json({ success: false, error: 'تتضمن الإجابات خيارًا غير صالح.' }, { status: 400 });
    }
  }

  const gradedResponses = questions.map((question) => {
    const answer = answers[question.id];
    const userAnswer = typeof answer === 'string' ? answer : '';
    const isCorrect =
      typeof question.correctAnswer === 'string' &&
      userAnswer.trim().toLocaleLowerCase('en') ===
        question.correctAnswer.trim().toLocaleLowerCase('en');

    return {
      sessionId: session.id,
      questionId: question.id,
      userAnswer,
      isCorrect,
      scoreAwarded: isCorrect ? 1 : 0,
    };
  });
  const correctCount = gradedResponses.filter((response) => response.isCorrect).length;
  const overallScore = Math.round((correctCount / questions.length) * 100);
  const cefrLevel = levelForScore(overallScore);
  const verificationCode = `SEEN-${new Date().getFullYear()}-${randomUUID().toUpperCase()}`;

  try {
    const certificate = await prisma.$transaction(async (transaction) => {
      const claimedSession = await transaction.testSession.updateMany({
        where: {
          id: session.id,
          userId: user.id,
          status: 'IN_PROGRESS',
        },
        data: {
          status: 'COMPLETED',
          score: overallScore,
          cefrResult: cefrLevel,
          completedAt: new Date(),
        },
      });
      if (claimedSession.count !== 1) {
        throw new SubmissionConflictError();
      }

      await transaction.response.createMany({ data: gradedResponses });
      return transaction.certificate.create({
        data: {
          userId: user.id,
          sessionId: session.id,
          cefrLevel,
          verificationCode,
          overallScore,
        },
        select: { verificationCode: true, cefrLevel: true, overallScore: true },
      });
    });

    return NextResponse.json({
      success: true,
      certificate,
      redirectUrl: `/verify/${certificate.verificationCode}`,
    });
  } catch (error) {
    if (error instanceof SubmissionConflictError) {
      return NextResponse.json(
        { success: false, error: 'تم تسليم هذا الاختبار مسبقًا.' },
        { status: 409 },
      );
    }
    console.error('Error grading and storing test submission:', error);
    return NextResponse.json(
      { success: false, error: 'تعذر معالجة الاختبار حاليًا.' },
      { status: 500 },
    );
  }
}
