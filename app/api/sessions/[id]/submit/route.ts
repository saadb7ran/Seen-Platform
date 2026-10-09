import { randomBytes } from "node:crypto";
import { SessionStatus, SkillType } from "@prisma/client";
import { getCurrentUser } from "@/lib/auth";
import { cefrFromPercentage, decimalScore, gradeResponse, transcribeRecording } from "@/lib/grading";
import { jsonError } from "@/lib/http";
import { prisma } from "@/lib/prisma";

export const maxDuration = 60;

type SubmitContext = { params: Promise<{ id: string }> };

export async function POST(_request: Request, context: SubmitContext) {
  const user = await getCurrentUser();
  if (!user) return jsonError("يلزم تسجيل الدخول.", 401);
  const { id } = await context.params;
  const session = await prisma.studentTestSession.findUnique({
    where: { id },
    include: {
      test: { include: { testQuestions: { include: { question: true } } } },
      answers: true,
    },
  });
  if (!session || session.studentId !== user.id) return jsonError("جلسة الاختبار غير موجودة.", 404);
  if (session.status !== SessionStatus.IN_PROGRESS) return jsonError("تم تسليم الاختبار مسبقًا.", 409);
  const answersByQuestion = new Map(session.answers.map((answer) => [answer.questionId, answer]));
  const grades = new Map<string, { score: number; feedback: string | null; isCorrect: boolean | null }>();
  let hasPendingOpenResponse = false;
  for (const { question } of session.test.testQuestions) {
    const answer = answersByQuestion.get(question.id);
    const points = Number(question.points);
    if (question.questionType === "MCQ") {
      const correct = Boolean(answer?.selectedOption && answer.selectedOption === question.correctAnswer);
      grades.set(question.id, { score: correct ? points : 0, feedback: null, isCorrect: correct });
      continue;
    }
    let text = answer?.textAnswer?.trim() ?? "";
    if (question.questionType === "AUDIO_PROMPT" && answer?.audioRecordingUrl && process.env.OPENAI_API_KEY) {
      text = await transcribeRecording(answer.audioRecordingUrl);
      await prisma.studentAnswer.update({
        where: { sessionId_questionId: { sessionId: id, questionId: question.id } },
        data: { audioTranscript: text },
      });
    }
    if (text && process.env.OPENAI_API_KEY) {
      const result = await gradeResponse(question.contentText, text, question.skill);
      grades.set(question.id, { score: points * result.score / 100, feedback: result.feedback, isCorrect: null });
    } else {
      grades.set(question.id, { score: 0, feedback: null, isCorrect: null });
      if (text || answer?.audioRecordingUrl) hasPendingOpenResponse = true;
    }
  }
  await prisma.$transaction(
    [...grades].map(([questionId, grade]) =>
      prisma.studentAnswer.upsert({
        where: { sessionId_questionId: { sessionId: id, questionId } },
        create: { sessionId: id, questionId, score: decimalScore(grade.score), feedback: grade.feedback, isCorrect: grade.isCorrect },
        update: { score: decimalScore(grade.score), feedback: grade.feedback, isCorrect: grade.isCorrect },
      }),
    ),
  );

  if (hasPendingOpenResponse) {
    await prisma.studentTestSession.update({
      where: { id },
      data: { status: SessionStatus.SUBMITTED, completedAt: new Date() },
    });
    return Response.json({ status: SessionStatus.SUBMITTED, message: "تم التسليم وتنتظر الإجابات المفتوحة التصحيح." });
  }

  const answerRows = await prisma.studentAnswer.findMany({ where: { sessionId: id } });
  const skillScores = new Map<SkillType, { earned: number; possible: number }>();
  for (const { question, weight } of session.test.testQuestions) {
    const aggregate = skillScores.get(question.skill) ?? { earned: 0, possible: 0 };
    const multiplier = Number(weight);
    aggregate.possible += Number(question.points) * multiplier;
    const answer = answerRows.find((item) => item.questionId === question.id);
    aggregate.earned += Number(answer?.score ?? 0) * multiplier;
    skillScores.set(question.skill, aggregate);
  }
  const skillPercentage = (skill: SkillType) => {
    const score = skillScores.get(skill);
    return score && score.possible > 0 ? score.earned * 100 / score.possible : null;
  };
  const presentScores = [...skillScores.values()].filter((score) => score.possible > 0);
  const total = presentScores.length
    ? presentScores.reduce((sum, score) => sum + score.earned, 0) * 100 /
      presentScores.reduce((sum, score) => sum + score.possible, 0)
    : 0;
  const certificateId = `SEEN-${Date.now().toString(36).toUpperCase()}-${randomBytes(4).toString("hex").toUpperCase()}`;
  const completed = await prisma.studentTestSession.update({
    where: { id },
    data: {
      status: SessionStatus.GRADED,
      completedAt: new Date(),
      totalScore: decimalScore(total),
      cefrLevel: cefrFromPercentage(total),
      listeningScore: skillPercentage(SkillType.LISTENING) === null ? null : decimalScore(skillPercentage(SkillType.LISTENING)!),
      speakingScore: skillPercentage(SkillType.SPEAKING) === null ? null : decimalScore(skillPercentage(SkillType.SPEAKING)!),
      readingScore: skillPercentage(SkillType.READING) === null ? null : decimalScore(skillPercentage(SkillType.READING)!),
      writingScore: skillPercentage(SkillType.WRITING) === null ? null : decimalScore(skillPercentage(SkillType.WRITING)!),
      certificateId,
    },
    select: { certificateId: true, cefrLevel: true, totalScore: true },
  });
  return Response.json({ status: SessionStatus.GRADED, result: { ...completed, totalScore: Number(completed.totalScore) } });
}
