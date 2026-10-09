import { TestStatus, UserRole } from "@prisma/client";
import { getCurrentUser, hasRole } from "@/lib/auth";
import { jsonError, readJson } from "@/lib/http";
import { prisma } from "@/lib/prisma";

type TestContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: TestContext) {
  const user = await getCurrentUser();
  if (!hasRole(user, UserRole.ADMIN, UserRole.TEACHER)) return jsonError("غير مصرح.", 403);
  const { id } = await context.params;
  let body: { status?: TestStatus };
  try {
    body = await readJson(request);
  } catch {
    return jsonError("بيانات غير صالحة.");
  }

  if (!Object.values(TestStatus).includes(body.status as TestStatus)) return jsonError("حالة الاختبار غير صالحة.");
  const test = await prisma.test.findUnique({ where: { id }, include: { _count: { select: { testQuestions: true } } } });
  if (!test) return jsonError("الاختبار غير موجود.", 404);
  if (body.status === TestStatus.ACTIVE && test._count.testQuestions === 0) return jsonError("أضف أسئلة قبل تفعيل الاختبار.");
  const updated = await prisma.test.update({ where: { id }, data: { status: body.status } });
  return Response.json({ test: updated });
}

export async function DELETE(_request: Request, context: TestContext) {
  const user = await getCurrentUser();
  if (!hasRole(user, UserRole.ADMIN, UserRole.TEACHER)) return jsonError("غير مصرح.", 403);
  const { id } = await context.params;
  const test = await prisma.test.findUnique({ where: { id }, include: { _count: { select: { sessions: true } } } });
  if (!test) return jsonError("الاختبار غير موجود.", 404);
  if (test._count.sessions > 0) return jsonError("لا يمكن حذف اختبار له جلسات طالبة مسجلة.", 409);
  await prisma.test.delete({ where: { id } });
  return Response.json({ ok: true });
}
