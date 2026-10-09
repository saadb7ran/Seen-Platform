import { randomUUID } from "node:crypto";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { SessionStatus } from "@prisma/client";
import { getCurrentUser } from "@/lib/auth";
import { jsonError, readJson } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { getStorageClient } from "@/lib/storage";

type UploadRequest = { sessionId?: string; questionId?: string; contentType?: string; size?: number };
const allowedTypes = new Set(["audio/webm", "audio/mp4", "audio/mpeg", "audio/mp3", "audio/wav", "audio/x-wav", "audio/ogg"]);

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return jsonError("يلزم تسجيل الدخول.", 401);
  let body: UploadRequest;
  try {
    body = await readJson<UploadRequest>(request);
  } catch {
    return jsonError("بيانات الملف غير صالحة.");
  }
  if (!body.sessionId || !body.questionId || !body.contentType || !allowedTypes.has(body.contentType) ||
    !Number.isSafeInteger(body.size) || (body.size ?? 0) < 1 || (body.size ?? 0) > 15 * 1024 * 1024) {
    return jsonError("نوع التسجيل الصوتي أو بياناته غير صالحة.");
  }
  const session = await prisma.studentTestSession.findUnique({
    where: { id: body.sessionId },
    include: { test: { include: { testQuestions: { where: { questionId: body.questionId }, include: { question: true } } } } },
  });
  if (!session || session.studentId !== user.id || session.status !== SessionStatus.IN_PROGRESS ||
    session.test.testQuestions[0]?.question.questionType !== "AUDIO_PROMPT") {
    return jsonError("جلسة الاختبار أو السؤال غير صالح.", 403);
  }
  const uploadDeadline = Math.min(
    session.test.endTime.getTime(),
    session.startedAt.getTime() + session.test.durationMinutes * 60_000,
  );
  if (Date.now() > uploadDeadline) return jsonError("انتهى وقت رفع الإجابات.", 410);
  try {
    const { bucket, client } = getStorageClient();
    const key = `recordings/${user.id}/${session.id}/${body.questionId}/${randomUUID()}`;
    const uploadUrl = await getSignedUrl(client, new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      ContentType: body.contentType,
      ContentLength: body.size,
    }), { expiresIn: 300 });
    await prisma.studentAnswer.upsert({
      where: { sessionId_questionId: { sessionId: session.id, questionId: body.questionId } },
      create: { sessionId: session.id, questionId: body.questionId, audioRecordingUrl: key },
      update: { audioRecordingUrl: key },
    });
    return Response.json({ uploadUrl, key, expiresIn: 300 });
  } catch (error) {
    console.error("Audio upload URL could not be created", error);
    return jsonError("خدمة التخزين غير جاهزة. يرجى المحاولة لاحقًا.", 503);
  }
}
