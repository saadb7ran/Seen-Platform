import { SessionStatus, TestStatus, UserRole } from "@prisma/client";
import { randomInt } from "node:crypto";
import { getCurrentUser } from "@/lib/auth";
import { jsonError } from "@/lib/http";
import { prisma } from "@/lib/prisma";

type ExamContext = { params: Promise<{ accessCode: string }> };

export async function GET(_request: Request, context: ExamContext) {
  const user = await getCurrentUser();
  const { accessCode } = await context.params;
  const test = await prisma.test.findUnique({
    where: { accessCode: accessCode.toUpperCase() },
    include: { _count: { select: { testQuestions: true } } },
  });
  if (!test) return jsonError("الاختبار غير موجود.", 404);
  const now = new Date();
  const isScheduled = test.status === TestStatus.ACTIVE && now >= test.startTime && now <= test.endTime;
  const hasExistingAttempt = user?.role === UserRole.STUDENT && await prisma.studentTestSession.findFirst({
    where: { studentId: user.id, testId: test.id, status: SessionStatus.IN_PROGRESS },
    select: { id: true },
  });
  if (!isScheduled && !hasExistingAttempt) return jsonError("الاختبار غير متاح حاليًا.", 410);
  return Response.json({
    test: {
      id: test.id,
      title: test.title,
      durationMinutes: test.durationMinutes,
      questionCount: test._count.testQuestions,
    },
  });
}

export async function POST(_request: Request, context: ExamContext) {
  const user = await getCurrentUser();
  if (!user || user.role !== UserRole.STUDENT) return jsonError("سجّل الدخول بحساب طالبة للبدء.", 401);
  const { accessCode } = await context.params;
  const test = await prisma.test.findUnique({ where: { accessCode: accessCode.toUpperCase() } });
  if (!test) return jsonError("الاختبار غير متاح.", 404);
  const now = new Date();
  const existing = await prisma.studentTestSession.findFirst({
    where: { studentId: user.id, testId: test.id, status: SessionStatus.IN_PROGRESS },
    orderBy: { startedAt: "desc" },
  });
  if (existing) return Response.json({ sessionId: existing.id });
  if (test.status !== TestStatus.ACTIVE) return jsonError("الاختبار غير متاح.", 404);
  if (now < test.startTime || now > test.endTime) return jsonError("الاختبار خارج فترة الإتاحة.", 410);
  const testWithQuestions = await prisma.test.findUnique({
    where: { id: test.id },
    include: { testQuestions: { orderBy: { orderIndex: "asc" }, select: { questionId: true } } },
  });
  if (!testWithQuestions) return jsonError("الاختبار غير موجود.", 404);
  const questionOrder = testWithQuestions.testQuestions.map(({ questionId }) => questionId);
  if (test.isRandomized) {
    for (let index = questionOrder.length - 1; index > 0; index -= 1) {
      const target = randomInt(index + 1);
      [questionOrder[index], questionOrder[target]] = [questionOrder[target], questionOrder[index]];
    }
  }
  const session = await prisma.studentTestSession.create({
    data: { studentId: user.id, testId: test.id, questionOrder },
    select: { id: true },
  });
  return Response.json({ sessionId: session.id }, { status: 201 });
}
