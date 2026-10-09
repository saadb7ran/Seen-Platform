import Link from "next/link";
import { SessionStatus, UserRole } from "@prisma/client";
import LogoutButton from "@/app/logout-button";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [students, completed, active, pending, levels, recent] = await Promise.all([
    prisma.user.count({ where: { role: UserRole.STUDENT } }),
    prisma.studentTestSession.count({ where: { status: SessionStatus.GRADED } }),
    prisma.studentTestSession.count({ where: { status: SessionStatus.IN_PROGRESS } }),
    prisma.studentTestSession.count({ where: { status: SessionStatus.SUBMITTED } }),
    prisma.studentTestSession.groupBy({
      by: ["cefrLevel"],
      where: { status: SessionStatus.GRADED, cefrLevel: { not: null } },
      _count: { _all: true },
    }),
    prisma.studentTestSession.findMany({
      where: { status: SessionStatus.GRADED },
      orderBy: { completedAt: "desc" },
      take: 10,
      include: { student: { select: { fullName: true } }, test: { select: { title: true } } },
    }),
  ]);
  return (
    <main dir="rtl" className="min-h-screen bg-slate-50 p-5 sm:p-8 space-y-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div><h1 className="text-2xl font-black">لوحة إدارة منصة سين</h1><p className="mt-1 text-sm text-slate-500">نظرة حية على الحسابات ونتائج الاختبارات.</p></div>
        <div className="flex gap-3"><Link href="/admin/questions" className="rounded-lg bg-emerald-800 px-4 py-2 text-sm font-bold text-white">الأسئلة والاختبارات</Link><Link href="/admin/studio" className="rounded-lg border px-4 py-2 text-sm font-bold">مراجعة التصحيح ({pending})</Link><Link href="/admin/users" className="rounded-lg border px-4 py-2 text-sm font-bold">حسابات المعلمات</Link><LogoutButton /></div>
      </header>
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[["الطالبات", students], ["اختبارات معتمدة", completed], ["جلسات جارية", active], ["تنتظر التصحيح", pending]].map(([label, value]) => <article key={label} className="rounded-2xl border bg-white p-5"><p className="text-sm text-slate-500">{label}</p><p className="mt-2 text-3xl font-black">{value}</p></article>)}
      </section>
      <section className="rounded-2xl border bg-white p-5">
        <h2 className="text-lg font-extrabold">توزيع نتائج CEFR</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-4">
          {(["A1", "A2", "B1", "B2"] as const).map((level) => {
            const count = levels.find((item) => item.cefrLevel === level)?._count._all ?? 0;
            const percentage = completed ? Math.round(count * 100 / completed) : 0;
            return <div key={level} className="rounded-xl bg-slate-50 p-4"><div className="flex justify-between"><strong>{level}</strong><span>{count} ({percentage}%)</span></div><div className="mt-3 h-2 rounded bg-slate-200"><div className="h-2 rounded bg-emerald-700" style={{ width: `${percentage}%` }} /></div></div>;
          })}
        </div>
      </section>
      <section className="rounded-2xl border bg-white p-5">
        <h2 className="text-lg font-extrabold">أحدث النتائج</h2>
        <div className="mt-3 divide-y">
          {recent.map((session) => <div key={session.id} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm">
            <div><p className="font-bold">{session.student.fullName}</p><p className="text-slate-500">{session.test.title} · {session.completedAt?.toLocaleDateString("ar")}</p></div>
            <div className="flex items-center gap-3"><span>{session.cefrLevel} · {session.totalScore === null ? "—" : `${Number(session.totalScore).toFixed(1)}%`}</span>{session.certificateId && <Link href={`/report/${session.certificateId}`} className="text-blue-700 underline">الشهادة</Link>}</div>
          </div>)}
          {!recent.length && <p className="py-4 text-sm text-slate-500">لا توجد نتائج معتمدة بعد.</p>}
        </div>
      </section>
    </main>
  );
}
