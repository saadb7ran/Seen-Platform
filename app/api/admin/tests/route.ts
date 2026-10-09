import { randomBytes } from "node:crypto";
import { TestStatus, UserRole } from "@prisma/client";
import { getCurrentUser, hasRole } from "@/lib/auth";
import { jsonError, readJson } from "@/lib/http";
import { prisma } from "@/lib/prisma";

type TestInput = {
  title?: string;
  startTime?: string;
  endTime?: string;
  durationMinutes?: number;
  questionIds?: string[];
  status?: TestStatus;
  isRandomized?: boolean;
};

function makeAccessCode() {
  return randomBytes(5).toString("hex").toUpperCase();
}

export async function GET() {
  const user = await getCurrentUser();
  if (!hasRole(user, UserRole.ADMIN, UserRole.TEACHER)) return jsonError("غير مصرح.", 403);
  const tests = await prisma.test.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { sessions: true } }, testQuestions: { include: { question: true } } },
  });
  return Response.json({ tests });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!hasRole(user, UserRole.ADMIN, UserRole.TEACHER)) return jsonError("غير مصرح.", 403);
  let body: TestInput;
  try {
    body = await readJson<TestInput>(request);
  } catch {
    return jsonError("بيانات الاختبار غير صالحة.");
  }
  const startTime = new Date(body.startTime ?? "");
  const endTime = new Date(body.endTime ?? "");
  if (!body.title?.trim() || body.title.length > 255) return jsonError("عنوان الاختبار مطلوب.");
  if (Number.isNaN(startTime.getTime()) || Number.isNaN(endTime.getTime()) || startTime >= endTime) {
    return jsonError("حدد وقت بداية ونهاية صحيحين.");
  }
  if (!Number.isInteger(body.durationMinutes) || (body.durationMinutes ?? 0) < 1 || (body.durationMinutes ?? 0) > 480) {
    return jsonError("مدة الاختبار يجب أن تكون بين دقيقة و8 ساعات.");
  }
  if (!Array.isArray(body.questionIds) || body.questionIds.length === 0) return jsonError("أضف سؤالًا واحدًا على الأقل.");
  if (body.questionIds.length > 100) return jsonError("الحد الأقصى للاختبار 100 سؤال.");
  if (new Set(body.questionIds).size !== body.questionIds.length) return jsonError("توجد أسئلة مكررة.");
  if (body.isRandomized !== undefined && typeof body.isRandomized !== "boolean") return jsonError("إعداد ترتيب الأسئلة غير صالح.");
  const questions = await prisma.questionBank.findMany({ where: { id: { in: body.questionIds } }, select: { id: true } });
  if (questions.length !== body.questionIds.length) return jsonError("أحد الأسئلة المحددة غير موجود.");
  const status = body.status === TestStatus.ACTIVE ? TestStatus.ACTIVE : TestStatus.DRAFT;
  const test = await prisma.test.create({
    data: {
      title: body.title.trim(),
      createdById: user!.id,
      startTime,
      endTime,
      durationMinutes: body.durationMinutes!,
      accessCode: makeAccessCode(),
      status,
      isRandomized: body.isRandomized ?? true,
      testQuestions: { create: body.questionIds.map((questionId, orderIndex) => ({ questionId, orderIndex })) },
    },
    include: { testQuestions: { include: { question: true } } },
  });
  return Response.json({ test }, { status: 201 });
}
