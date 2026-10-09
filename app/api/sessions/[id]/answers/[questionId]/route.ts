import { SessionStatus } from "@prisma/client";
import { getCurrentUser } from "@/lib/auth";
import { jsonError, readJson } from "@/lib/http";
import { prisma } from "@/lib/prisma";

type AnswerInput = {
  selectedOption?: string | null;
  textAnswer?: string | null;
  audioRecordingUrl?: string | null;
};

type AnswerContext = { params: Promise<{ id: string; questionId: string }> };

export async function PUT(request: Request, context: AnswerContext) {
  const user = await getCurrentUser();
  if (!user) return jsonError("يلزم تسجيل الدخول.", 401);
  const { id, questionId } = await context.params;
  let body: AnswerInput;
  try {
    body = await readJson<AnswerInput>(request);
  } catch {
    return jsonError("صيغة الإجابة غير صالحة.");
  }
  if ((body.textAnswer?.length ?? 0) > 20000) return jsonError("الإجابة النصية أطول من الحد المسموح.");
  const session = await prisma.studentTestSession.findUnique({
    where: { id },
    include: { test: { include: { testQuestions: { where: { questionId } } } } },
  });
  if (!session || session.studentId !== user.id) return jsonError("جلسة الاختبار غير موجودة.", 404);
  if (session.status !== SessionStatus.IN_PROGRESS) return jsonError("تم تسليم الاختبار ولا يمكن تعديل الإجابات.", 409);
  const deadline = Math.min(
    session.test.endTime.getTime(),
    session.startedAt.getTime() + session.test.durationMinutes * 60_000,
  );
  if (Date.now() > deadline) return jsonError("انتهى وقت الاختبار.", 410);
  if (session.test.testQuestions.length === 0) return jsonError("السؤال لا ينتمي إلى هذا الاختبار.", 404);
  if (body.audioRecordingUrl && !body.audioRecordingUrl.startsWith(`recordings/${user.id}/${id}/${questionId}/`)) {
    return jsonError("مسار التسجيل غير صالح.", 400);
  }
  if (body.audioRecordingUrl) {
    const uploadedAudio = await prisma.studentAnswer.findUnique({
      where: { sessionId_questionId: { sessionId: id, questionId } },
      select: { audioRecordingUrl: true },
    });
    if (uploadedAudio?.audioRecordingUrl !== body.audioRecordingUrl) return jsonError("التسجيل الصوتي لم يُرفع عبر خدمة المنصة.", 400);
  }
  const answer = await prisma.studentAnswer.upsert({
    where: { sessionId_questionId: { sessionId: id, questionId } },
    create: {
      sessionId: id,
      questionId,
      selectedOption: body.selectedOption ?? null,
      textAnswer: body.textAnswer ?? null,
      audioRecordingUrl: body.audioRecordingUrl ?? null,
    },
    update: {
      selectedOption: body.selectedOption ?? null,
      textAnswer: body.textAnswer ?? null,
      ...(Object.hasOwn(body, "audioRecordingUrl")
        ? { audioRecordingUrl: body.audioRecordingUrl ?? null }
        : {}),
    },
  });
  return Response.json({ saved: true, answerId: answer.id });
}
