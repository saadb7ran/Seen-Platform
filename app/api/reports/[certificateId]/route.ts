import { SessionStatus } from "@prisma/client";
import { jsonError } from "@/lib/http";
import { prisma } from "@/lib/prisma";

type ReportContext = { params: Promise<{ certificateId: string }> };

export async function GET(_request: Request, context: ReportContext) {
  const { certificateId } = await context.params;
  const session = await prisma.studentTestSession.findUnique({
    where: { certificateId },
    include: {
      student: { select: { fullName: true, gradeLevel: true } },
      test: { select: { title: true } },
      answers: { include: { question: { select: { skill: true, contentText: true, points: true } } } },
    },
  });
  if (!session || session.status !== SessionStatus.GRADED) return jsonError("الشهادة غير موجودة أو لم يتم اعتمادها.", 404);
  return Response.json({
    report: {
      certificateId: session.certificateId,
      student: session.student,
      test: session.test,
      completedAt: session.completedAt,
      totalScore: Number(session.totalScore),
      cefrLevel: session.cefrLevel,
      skillScores: {
        LISTENING: session.listeningScore === null ? null : Number(session.listeningScore),
        SPEAKING: session.speakingScore === null ? null : Number(session.speakingScore),
        READING: session.readingScore === null ? null : Number(session.readingScore),
        WRITING: session.writingScore === null ? null : Number(session.writingScore),
      },
      answers: session.answers.map(({ question, score, feedback }) => ({
        skill: question.skill,
        question: question.contentText,
        score: Number(score),
        maxScore: Number(question.points),
        feedback,
      })),
    },
  });
}
