import { Prisma } from '@prisma/client';
import { NextResponse } from 'next/server';
import {
  assertAuthConfigured,
  createSessionToken,
  SESSION_COOKIE,
  SESSION_MAX_AGE,
} from '@/lib/auth';
import { hashPassword } from '@/lib/password';
import { prisma } from '@/lib/prisma';
import { registrationSchema } from '@/lib/validation';

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'صيغة الطلب غير صالحة.' }, { status: 400 });
  }

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return NextResponse.json({ error: 'البيانات المدخلة غير صالحة.' }, { status: 400 });
  }

  const input = registrationSchema.safeParse(body);
  if (!input.success) {
    return NextResponse.json(
      { error: 'أدخل اسمًا وبريدًا صالحين وكلمة مرور من 12 حرفًا على الأقل.' },
      { status: 400 },
    );
  }
  const { name, email, password } = input.data;

  try {
    assertAuthConfigured();
  } catch (error) {
    console.error('Authentication configuration error:', error);
    return NextResponse.json({ error: 'خدمة تسجيل الدخول غير مهيأة.' }, { status: 500 });
  }

  const normalizedEmail = email.toLowerCase();
  try {
    const user = await prisma.user.create({
      data: {
        name,
        email: normalizedEmail,
        passwordHash: await hashPassword(password),
        role: 'STUDENT',
      },
      select: { id: true, name: true, email: true, role: true, sessionVersion: true },
    });
    const response = NextResponse.json({
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      redirectTo: '/',
    }, { status: 201 });
    response.cookies.set(SESSION_COOKIE, createSessionToken(user.id, user.sessionVersion), {
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: SESSION_MAX_AGE,
    });
    return response;
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
    console.error('Account registration failed:', error);
    return NextResponse.json({ error: 'تعذر إنشاء الحساب حاليًا.' }, { status: 500 });
  }
}
