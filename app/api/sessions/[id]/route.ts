import { UserRole } from "@prisma/client";
import { getCurrentUser } from "@/lib/auth";
import { jsonError } from "@/lib/http";
import { prisma } from "@/lib/prisma";

type SessionContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: SessionContext) {
  const user = await getCurrentUser();
  if (!user) return jsonError("يلزم تسجيل الدخول.", 401);
  const { id } = await context.params;
  const session = await prisma.studentTestSession.findUnique({
    where: { id },
    include: {
      test: { include: { testQuestions: { orderBy: { orderIndex: "asc" }, include: { question: true } } } },
      answers: true,
    },
  });
  if (!session) return jsonError("جلسة الاختبار غير موجودة.", 404);
  if (session.studentId !== user.id && user.role !== UserRole.ADMIN && user.role !== UserRole.TEACHER) {
    return jsonError("غير مصرح.", 403);
  }
  const answers = new Map(session.answers.map((answer) => [answer.questionId, answer]));
  const order = Array.isArray(session.questionOrder) ? session.questionOrder.filter((item): item is string => typeof item === "string") : [];
  const questionIndex = new Map(order.map((questionId, index) => [questionId, index]));
  const questions = [...session.test.testQuestions].sort((a, b) =>
    (questionIndex.get(a.question.id) ?? a.orderIndex) - (questionIndex.get(b.question.id) ?? b.orderIndex)
  );
  const deadlineAt = new Date(Math.min(
    session.test.endTime.getTime(),
    session.startedAt.getTime() + session.test.durationMinutes * 60_000,
  ));
  return Response.json({
    session: {
      id: session.id,
      status: session.status,
      startedAt: session.startedAt,
      deadlineAt,
      completedAt: session.completedAt,
      totalScore: session.totalScore,
      cefrLevel: session.cefrLevel,
      certificateId: session.certificateId,
      test: {
        id: session.test.id,
        title: session.test.title,
        durationMinutes: session.test.durationMinutes,
        questions: questions.map(({ weight, question }) => ({
          id: question.id,
          skill: question.skill,
          questionType: question.questionType,
          contentText: question.contentText,
          mediaUrl: question.mediaUrl,
          options: question.optionsJson,
          difficultyLevel: question.difficultyLevel,
          points: Number(weight) * Number(question.points),
          answer: answers.get(question.id)
            ? {
                selectedOption: answers.get(question.id)!.selectedOption,
                textAnswer: answers.get(question.id)!.textAnswer,
                score: Number(answers.get(question.id)!.score),
                feedback: answers.get(question.id)!.feedback,
              }
            : null,
        })),
      },
    },
  });
}
