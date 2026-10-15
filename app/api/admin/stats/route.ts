import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const admin = await getSessionUser();
  if (!admin) {
    return NextResponse.json({ error: 'يلزم تسجيل الدخول.' }, { status: 401 });
  }
  if (admin.role !== 'ADMIN') {
    return NextResponse.json({ error: 'ليس لديك صلاحية تنفيذ هذا الإجراء.' }, { status: 403 });
  }

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const [testsToday, certificates, questions, average] = await Promise.all([
    prisma.testSession.count({ where: { startedAt: { gte: startOfDay } } }),
    prisma.certificate.count(),
    prisma.questionBank.count(),
    prisma.testSession.aggregate({
      where: { status: 'COMPLETED', score: { not: null } },
      _avg: { score: true },
    }),
  ]);

  return NextResponse.json({
    testsToday,
    certificates,
    questions,
    averageScore: average._avg.score === null ? null : Math.round(average._avg.score),
  });
}
