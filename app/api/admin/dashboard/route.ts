import { SessionStatus, UserRole } from "@prisma/client";
import { getCurrentUser, hasRole } from "@/lib/auth";
import { jsonError } from "@/lib/http";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await getCurrentUser();
  if (!hasRole(user, UserRole.ADMIN, UserRole.TEACHER)) return jsonError("غير مصرح.", 403);
  const [studentCount, completedCount, activeCount, pendingCount, recentSessions] = await Promise.all([
    prisma.user.count({ where: { role: UserRole.STUDENT } }),
    prisma.studentTestSession.count({ where: { status: SessionStatus.GRADED } }),
    prisma.studentTestSession.count({ where: { status: SessionStatus.IN_PROGRESS } }),
    prisma.studentTestSession.count({ where: { status: SessionStatus.SUBMITTED } }),
    prisma.studentTestSession.findMany({
      where: { status: SessionStatus.GRADED },
      orderBy: { completedAt: "desc" },
      take: 8,
      select: {
        id: true, totalScore: true, cefrLevel: true, certificateId: true, completedAt: true,
        student: { select: { fullName: true } },
        test: { select: { title: true } },
      },
    }),
  ]);
  const levels = await prisma.studentTestSession.groupBy({
    by: ["cefrLevel"],
    where: { status: SessionStatus.GRADED, cefrLevel: { not: null } },
    _count: { _all: true },
  });
  return Response.json({
    stats: { studentCount, completedCount, activeCount, pendingCount },
    levels: levels.map(({ cefrLevel, _count }) => ({ cefrLevel, count: _count._all })),
    recentSessions: recentSessions.map((session) => ({
      ...session,
      totalScore: session.totalScore === null ? null : Number(session.totalScore),
    })),
  });
}
