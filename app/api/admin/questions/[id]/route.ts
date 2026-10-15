import { Prisma } from '@prisma/client';
import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await getSessionUser();
  if (!admin) {
    return NextResponse.json({ error: 'يلزم تسجيل الدخول.' }, { status: 401 });
  }
  if (admin.role !== 'ADMIN') {
    return NextResponse.json({ error: 'ليس لديك صلاحية تنفيذ هذا الإجراء.' }, { status: 403 });
  }

  const { id } = await params;
  try {
    await prisma.questionBank.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      return NextResponse.json({ error: 'السؤال غير موجود.' }, { status: 404 });
    }
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2003'
    ) {
      return NextResponse.json(
        { error: 'لا يمكن حذف سؤال مرتبط باختبار منشور.' },
        { status: 409 },
      );
    }
    console.error('Administrator could not delete question:', error);
    return NextResponse.json({ error: 'تعذر حذف السؤال حاليًا.' }, { status: 500 });
  }
}
