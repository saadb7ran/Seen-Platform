import Link from "next/link";
import { redirect } from "next/navigation";
import { SessionStatus, TestStatus, UserRole } from "@prisma/client";
import LogoutButton from "@/app/logout-button";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function StudentAccountPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/account");
  if (user.role !== UserRole.STUDENT) redirect("/admin/dashboard");
  const [sessions, availableTests] = await Promise.all([
    prisma.studentTestSession.findMany({
      where: { studentId: user.id },
      orderBy: { startedAt: "desc" },
      take: 25,
      include: { test: { select: { title: true, accessCode: true } } },
    }),
    prisma.test.findMany({
      where: { status: TestStatus.ACTIVE, startTime: { lte: new Date() }, endTime: { gte: new Date() } },
      orderBy: { startTime: "asc" },
      select: { id: true, title: true, accessCode: true, durationMinutes: true },
    }),
  ]);
  return (
    <main dir="rtl" className="min-h-screen bg-slate-50 p-5 sm:p-8 space-y-7">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div><p className="text-sm text-emerald-800 font-bold">مرحبًا، {user.fullName}</p><h1 className="mt-1 text-2xl font-black">حساب الطالبة</h1></div>
        <LogoutButton />
      </header>
      <section className="space-y-3">
        <h2 className="text-lg font-extrabold">الاختبارات المتاحة الآن</h2>
        {!availableTests.length && <p className="rounded-xl border bg-white p-4 text-sm text-slate-600">لا توجد اختبارات مفتوحة حاليًا.</p>}
        <div className="grid gap-3 sm:grid-cols-2">
          {availableTests.map((test) => <article key={test.id} className="rounded-2xl border bg-white p-5">
            <h3 className="font-bold">{test.title}</h3><p className="mt-1 text-sm text-slate-500">المدة: {test.durationMinutes} دقيقة · الرمز: {test.accessCode}</p>
            <Link href={`/exam/${test.accessCode}`} className="mt-3 inline-block rounded-lg bg-emerald-800 px-4 py-2 text-sm font-bold text-white">بدء الاختبار</Link>
          </article>)}
        </div>
      </section>
      <section className="rounded-2xl border bg-white p-5">
        <h2 className="text-lg font-extrabold">سجل الاختبارات</h2>
        <div className="mt-3 divide-y">
          {sessions.map((session) => <article key={session.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
            <div><h3 className="font-bold">{session.test.title}</h3><p className="mt-1 text-sm text-slate-500">{session.startedAt.toLocaleDateString("ar")} · {session.status}</p></div>
            {session.status === SessionStatus.IN_PROGRESS
              ? <Link href={`/exam/${session.test.accessCode}?session=${session.id}`} className="text-sm font-bold text-blue-700 underline">متابعة الاختبار</Link>
              : session.status === SessionStatus.GRADED && session.certificateId
                ? <Link href={`/report/${session.certificateId}`} className="text-sm font-bold text-emerald-800 underline">عرض النتيجة</Link>
                : <span className="text-sm text-amber-700">بانتظار اعتماد النتيجة</span>}
          </article>)}
          {!sessions.length && <p className="py-4 text-sm text-slate-500">لم تبدأ أي اختبار بعد.</p>}
        </div>
      </section>
    </main>
  );
}
