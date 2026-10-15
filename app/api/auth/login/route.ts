import { NextResponse } from 'next/server';
import {
  assertAuthConfigured,
  createSessionToken,
  SESSION_COOKIE,
  SESSION_MAX_AGE,
} from '@/lib/auth';
import { hashPassword, needsPasswordUpgrade, verifyPassword } from '@/lib/password';
import { prisma } from '@/lib/prisma';
import { loginSchema } from '@/lib/validation';

const LOGIN_ATTEMPT_RETENTION_DAYS = 90;

async function recordLoginAttempt(email: string, successful: boolean) {
  const retentionCutoff = new Date(
    Date.now() - LOGIN_ATTEMPT_RETENTION_DAYS * 24 * 60 * 60 * 1000,
  );
  await prisma.$transaction([
    prisma.loginAttempt.deleteMany({
      where: { attemptedAt: { lt: retentionCutoff } },
    }),
    prisma.loginAttempt.create({
      data: { email, successful },
    }),
  ]);
}

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

  const input = loginSchema.safeParse(body);
  if (!input.success) {
    return NextResponse.json({ error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة.' }, { status: 400 });
  }
  const { email, password } = input.data;

  try {
    assertAuthConfigured();
  } catch (error) {
    console.error('Authentication configuration error:', error);
    return NextResponse.json({ error: 'خدمة تسجيل الدخول غير مهيأة.' }, { status: 500 });
  }

  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      passwordHash: true,
      sessionVersion: true,
    },
  });
  const passwordValid = await verifyPassword(password, user?.passwordHash);
  if (!user || !passwordValid) {
    try {
      await recordLoginAttempt(email.toLowerCase(), false);
    } catch (error) {
      console.error('Could not record failed login attempt:', error);
      return NextResponse.json({ error: 'تعذر إكمال تسجيل الدخول حاليًا.' }, { status: 500 });
    }
    return NextResponse.json(
      { error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة.' },
      { status: 401 },
    );
  }

  if (needsPasswordUpgrade(user.passwordHash)) {
    try {
      const migrated = await prisma.user.updateMany({
        where: { id: user.id, passwordHash: user.passwordHash },
        data: { passwordHash: await hashPassword(password) },
      });
      if (migrated.count !== 1) {
        await recordLoginAttempt(email.toLowerCase(), false);
        return NextResponse.json(
          { error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة.' },
          { status: 401 },
        );
      }
    } catch (error) {
      console.error('Could not upgrade a legacy password hash:', error);
      return NextResponse.json({ error: 'تعذر إكمال تسجيل الدخول حاليًا.' }, { status: 500 });
    }
  }

  try {
    await recordLoginAttempt(email.toLowerCase(), true);
  } catch (error) {
    console.error('Could not record successful login attempt:', error);
    return NextResponse.json({ error: 'تعذر إكمال تسجيل الدخول حاليًا.' }, { status: 500 });
  }

  const response = NextResponse.json({
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
    redirectTo: user.role === 'ADMIN' ? '/admin' : '/',
  });
  response.cookies.set(SESSION_COOKIE, createSessionToken(user.id, user.sessionVersion), {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_MAX_AGE,
  });
  return response;
}
