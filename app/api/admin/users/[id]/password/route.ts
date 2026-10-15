import { Prisma } from '@prisma/client';
import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { hashPassword } from '@/lib/password';
import { prisma } from '@/lib/prisma';
import { passwordResetSchema } from '@/lib/validation';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
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
  const password =
    body && typeof body === 'object' && !Array.isArray(body) && 'password' in body
      ? passwordResetSchema.safeParse(body.password)
      : null;
  if (!password?.success) {
    return NextResponse.json(
      { error: 'كلمة المرور الجديدة يجب أن تتكون من 12 إلى 128 حرفًا.' },
      { status: 400 },
    );
  }

  const { id } = await params;
  try {
    await prisma.user.update({
      where: { id },
      data: {
        passwordHash: await hashPassword(password.data),
        sessionVersion: { increment: 1 },
      },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      return NextResponse.json({ error: 'الحساب غير موجود.' }, { status: 404 });
    }
    console.error('Administrator could not reset account password:', error);
    return NextResponse.json({ error: 'تعذر إعادة تعيين كلمة المرور.' }, { status: 500 });
  }
}
