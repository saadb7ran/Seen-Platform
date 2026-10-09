import { SessionStatus, UserRole } from "@prisma/client";
import { getCurrentUser, hasRole } from "@/lib/auth";
import { cefrFromPercentage, decimalScore } from "@/lib/grading";
import { jsonError, readJson } from "@/lib/http";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await getCurrentUser();
  if (!hasRole(user, UserRole.ADMIN, UserRole.TEACHER)) return jsonError("غير مصرح.", 403);
  const sessions = await prisma.studentTestSession.findMany({
    where: { status: SessionStatus.SUBMITTED },
    orderBy: { completedAt: "asc" },
    include: { student: { select: { fullName: true, username: true } }, test: { select: { title: true } }, answers: { include: { question: true } } },
  });
  return Response.json({
    sessions: sessions.map((session) => ({
      id: session.id,
      student: session.student,
      test: session.test,
      answers: session.answers.map((answer) => ({
        questionId: answer.questionId,
        question: answer.question.contentText,
        skill: answer.question.skill,
        maxScore: Number(answer.question.points),
        response: answer.textAnswer,
        score: Number(answer.score),
        feedback: answer.feedback,
      })),
    })),
  });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!hasRole(user, UserRole.ADMIN, UserRole.TEACHER)) return jsonError("غير مصرح.", 403);
  let body: { sessionId?: string; answers?: Array<{ questionId?: string; score?: number; feedback?: string }> };
  try {
    body = await readJson(request);
  } catch {
    return jsonError("بيانات التصحيح غير صالحة.");
  }
  if (!body.sessionId || !Array.isArray(body.answers) || body.answers.length === 0) return jsonError("أدخل الدرجات المطلوبة.");
  const session = await prisma.studentTestSession.findUnique({
    where: { id: body.sessionId },
    include: { test: { include: { testQuestions: { include: { question: true } } } }, answers: true },
  });
  if (!session || session.status !== SessionStatus.SUBMITTED) return jsonError("الجلسة غير موجودة أو غير معلقة.", 404);
  const submitted = new Map(session.answers.map((answer) => [answer.questionId, answer]));
  if (body.answers.length !== session.test.testQuestions.length) return jsonError("يجب إدخال درجة لكل سؤال في الجلسة.");
  const seenQuestions = new Set<string>();
  const updates: Array<{ questionId: string; score: number; feedback: string | null }> = [];
  for (const entry of body.answers) {
    const existing = submitted.get(entry.questionId ?? "");
    const question = session.test.testQuestions.find(({ question }) => question.id === entry.questionId)?.question;
    if (entry.questionId) seenQuestions.add(entry.questionId);
    if (!existing || !question || typeof entry.score !== "number" || !Number.isFinite(entry.score) ||
      entry.score < 0 || entry.score > Number(question.points) || (entry.feedback?.length ?? 0) > 4000) {
      return jsonError("إحدى الدرجات أو التعليقات غير صالحة.");
    }
    updates.push({ questionId: question.id, score: entry.score, feedback: entry.feedback?.trim() || null });
  }
  if (seenQuestions.size !== session.test.testQuestions.length) return jsonError("توجد أسئلة مكررة أو ناقصة.");
  await prisma.$transaction(updates.map(({ questionId, score, feedback }) =>
    prisma.studentAnswer.update({
      where: { sessionId_questionId: { sessionId: session.id, questionId } },
      data: { score: decimalScore(score), feedback },
    })
  ));
  const refreshed = await prisma.studentAnswer.findMany({ where: { sessionId: session.id } });
  const totals = new Map<string, { earned: number; possible: number }>();
  for (const { question, weight } of session.test.testQuestions) {
    const factor = Number(weight);
    const current = totals.get(question.skill) ?? { earned: 0, possible: 0 };
    current.possible += Number(question.points) * factor;
    const answer = refreshed.find(({ questionId }) => questionId === question.id);
    current.earned += Number(answer?.score ?? 0) * factor;
    totals.set(question.skill, current);
  }
  const all = [...totals.values()];
  const overall = all.reduce((sum, item) => sum + item.earned, 0) * 100 / all.reduce((sum, item) => sum + item.possible, 0);
  const skill = (key: string) => {
    const item = totals.get(key);
    return item ? decimalScore(item.earned * 100 / item.possible) : null;
  };
  const certificateId = `SEEN-${Date.now().toString(36).toUpperCase()}-${session.id.slice(0, 8).toUpperCase()}`;
  const updated = await prisma.studentTestSession.update({
    where: { id: session.id },
    data: {
      status: SessionStatus.GRADED,
      completedAt: new Date(),
      totalScore: decimalScore(overall),
      cefrLevel: cefrFromPercentage(overall),
      listeningScore: skill("LISTENING"),
      speakingScore: skill("SPEAKING"),
      readingScore: skill("READING"),
      writingScore: skill("WRITING"),
      certificateId,
    },
    select: { id: true, totalScore: true, cefrLevel: true, certificateId: true },
  });
  return Response.json({ session: { ...updated, totalScore: Number(updated.totalScore) } });
}
