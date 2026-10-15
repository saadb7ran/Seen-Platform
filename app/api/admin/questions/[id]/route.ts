import { Prisma } from '@prisma/client';
import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await getSessionUser();
  if (!admin) {
    return NextResponse.json({ error: 'يلزم تسجيل الدخول.' }, { status: 401 });
  }
  if (admin.role !== 'ADMIN') {
    return NextResponse.json({ error: 'ليس لديك صلاحية تنفيذ هذا الإجراء.' }, { status: 403 });
  }

  const { id } = await params;
  try {
    await prisma.$transaction(
      async (transaction) => {
        const linkedExams = await transaction.testQuestion.findMany({
          where: { questionId: id },
          select: { examId: true },
        });
        const examIds = [...new Set(linkedExams.map(({ examId }) => examId))];
        if (examIds.length > 0) {
          const inProgressSessions = await transaction.testSession.findMany({
            where: { examId: { in: examIds }, status: 'IN_PROGRESS' },
            select: {
              id: true,
              startedAt: true,
              exam: { select: { durationMin: true } },
            },
          });
          const now = Date.now();
          const activeSessions = inProgressSessions.filter(
            (session) =>
              now < session.startedAt.getTime() + session.exam.durationMin * 60_000,
          );
          if (activeSessions.length > 0) {
            throw new Error('QUESTION_IN_ACTIVE_EXAM');
          }
          const expiredSessionIds = inProgressSessions
            .filter(
              (session) =>
                now >= session.startedAt.getTime() + session.exam.durationMin * 60_000,
            )
            .map(({ id: sessionId }) => sessionId);
          if (expiredSessionIds.length > 0) {
            await transaction.testSession.updateMany({
              where: { id: { in: expiredSessionIds }, status: 'IN_PROGRESS' },
              data: { status: 'TIMED_OUT' },
            });
          }
          await transaction.testQuestion.deleteMany({
            where: { questionId: id },
          });
        }

        await transaction.questionBank.delete({ where: { id } });
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message === 'QUESTION_IN_ACTIVE_EXAM') {
      return NextResponse.json(
        { error: 'لا يمكن حذف السؤال أثناء وجود اختبار جارٍ يستخدمه.' },
        { status: 409 },
      );
    }
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      return NextResponse.json({ error: 'السؤال غير موجود.' }, { status: 404 }      );
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2034') {
      return NextResponse.json(
        { error: 'تغيّرت بيانات الاختبار أثناء الحذف. أعد المحاولة.' },
        { status: 409 },
      );
    }
    console.error('Administrator could not delete question:', error);
    return NextResponse.json({ error: 'تعذر حذف السؤال حاليًا.' }, { status: 500 });
  }
}
