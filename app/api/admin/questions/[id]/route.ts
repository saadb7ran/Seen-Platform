import { UserRole } from "@prisma/client";
import { getCurrentUser, hasRole } from "@/lib/auth";
import { jsonError, readJson } from "@/lib/http";
import { prisma } from "@/lib/prisma";

type QuestionContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: QuestionContext) {
  const user = await getCurrentUser();
  if (!hasRole(user, UserRole.ADMIN, UserRole.TEACHER)) return jsonError("غير مصرح.", 403);
  const { id } = await context.params;
  let body: { contentText?: string; difficultyLevel?: string; points?: number };
  try {
    body = await readJson(request);
  } catch {
    return jsonError("بيانات التعديل غير صالحة.");
  }
  if (body.contentText !== undefined && (!body.contentText.trim() || body.contentText.length > 10000)) return jsonError("نص السؤال غير صالح.");
  if (body.difficultyLevel !== undefined && !["A1", "A2", "B1", "B2"].includes(body.difficultyLevel)) return jsonError("المستوى غير صالح.");
  if (body.points !== undefined && (!Number.isFinite(body.points) || body.points <= 0 || body.points > 100)) return jsonError("درجة السؤال غير صالحة.");
  const question = await prisma.questionBank.findUnique({ where: { id }, include: { _count: { select: { studentAnswers: true } } } });
  if (!question) return jsonError("السؤال غير موجود.", 404);
  if (question._count.studentAnswers > 0) return jsonError("لا يمكن تعديل سؤال سبق استخدامه في إجابة مسجلة.", 409);
  const updated = await prisma.questionBank.update({
    where: { id },
    data: {
      ...(body.contentText !== undefined ? { contentText: body.contentText.trim() } : {}),
      ...(body.difficultyLevel !== undefined ? { difficultyLevel: body.difficultyLevel as "A1" | "A2" | "B1" | "B2" } : {}),
      ...(body.points !== undefined ? { points: body.points } : {}),
    },
  });
  return Response.json({ question: updated });
}

export async function DELETE(_request: Request, context: QuestionContext) {
  const user = await getCurrentUser();
  if (!hasRole(user, UserRole.ADMIN, UserRole.TEACHER)) return jsonError("غير مصرح.", 403);
  const { id } = await context.params;
  const question = await prisma.questionBank.findUnique({ where: { id }, include: { _count: { select: { testQuestions: true, studentAnswers: true } } } });
  if (!question) return jsonError("السؤال غير موجود.", 404);
  if (question._count.testQuestions || question._count.studentAnswers) {
    return jsonError("لا يمكن حذف سؤال مرتبط باختبار أو إجابة مسجلة.", 409);
  }
  await prisma.questionBank.delete({ where: { id } });
  return Response.json({ ok: true });
}
