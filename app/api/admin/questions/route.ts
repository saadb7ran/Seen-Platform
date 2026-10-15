import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { adminQuestionSchema } from '@/lib/validation';

export async function GET() {
  const admin = await getSessionUser();
  if (!admin) {
    return NextResponse.json({ error: 'يلزم تسجيل الدخول.' }, { status: 401 });
  }
  if (admin.role !== 'ADMIN') {
    return NextResponse.json({ error: 'ليس لديك صلاحية تنفيذ هذا الإجراء.' }, { status: 403 });
  }

  const questions = await prisma.questionBank.findMany({
    orderBy: { createdAt: 'desc' },
    take: 200,
    select: {
      id: true,
      skill: true,
      cefrLevel: true,
      prompt: true,
      correctAnswer: true,
      options: true,
      passageText: true,
    },
  });
  return NextResponse.json({ questions });
}

export async function POST(request: Request) {
  const admin = await getSessionUser();
  if (!admin) {
    return NextResponse.json({ error: 'يلزم تسجيل الدخول.' }, { status: 401 });
  }
  if (admin.role !== 'ADMIN') {
    return NextResponse.json({ error: 'ليس لديك صلاحية تنفيذ هذا الإجراء.' }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'صيغة الطلب غير صالحة.' }, { status: 400 });
  }
  const input = adminQuestionSchema.safeParse(body);
  if (!input.success) {
    return NextResponse.json(
      { error: 'تحقق من المهارة والمستوى ونص السؤال والخيارات والإجابة ونص القراءة.' },
      { status: 400 },
    );
  }
  const { skill, level, prompt, answer, options, passage } = input.data;

  try {
    const question = await prisma.questionBank.create({
      data: {
        skill,
        cefrLevel: level,
        prompt,
        correctAnswer: answer,
        options,
        passageText: passage?.trim() || null,
      },
      select: {
        id: true,
        skill: true,
        cefrLevel: true,
        prompt: true,
        correctAnswer: true,
        options: true,
        passageText: true,
      },
    });
    return NextResponse.json({ question }, { status: 201 });
  } catch (error) {
    console.error('Administrator could not save the question:', error);
    return NextResponse.json({ error: 'تعذر حفظ السؤال حاليًا.' }, { status: 500 });
  }
}
