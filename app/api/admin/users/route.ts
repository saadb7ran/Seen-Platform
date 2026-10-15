import { Prisma } from '@prisma/client';
import { NextResponse } from 'next/server';
import { hashPassword } from '@/lib/password';
import { getSessionUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { adminUserSchema } from '@/lib/validation';

export async function GET() {
  const admin = await getSessionUser();
  if (!admin) {
    return NextResponse.json({ error: 'يلزم تسجيل الدخول.' }, { status: 401 });
  }
  if (admin.role !== 'ADMIN') {
    return NextResponse.json({ error: 'ليس لديك صلاحية تنفيذ هذا الإجراء.' }, { status: 403 });
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    take: 100,
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });
  return NextResponse.json({ users });
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
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return NextResponse.json({ error: 'البيانات المدخلة غير صالحة.' }, { status: 400 });
  }

  const input = adminUserSchema.safeParse(body);
  if (!input.success) {
    return NextResponse.json(
      { error: 'تحقق من الاسم والبريد وكلمة المرور والدور المحدد.' },
      { status: 400 },
    );
  }
  const { name, email, password, role } = input.data;

  try {
    const createdUser = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        passwordHash: await hashPassword(password),
        role,
      },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });
    return NextResponse.json({ user: createdUser }, { status: 201 });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      return NextResponse.json(
        { error: 'يوجد حساب مسجل بهذا البريد الإلكتروني.' },
        { status: 409 },
      );
    }
    console.error('Administrator could not create the account:', error);
    return NextResponse.json({ error: 'تعذر إنشاء الحساب حاليًا.' }, { status: 500 });
  }
}
