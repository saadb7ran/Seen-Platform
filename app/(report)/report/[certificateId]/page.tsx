import Link from "next/link";
import { notFound } from "next/navigation";
import { SessionStatus } from "@prisma/client";
import QrImage from "@/app/qr-image";
import PrintButton from "@/app/print-button";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const skills = [
  ["LISTENING", "الاستماع"],
  ["SPEAKING", "التحدث"],
  ["READING", "القراءة"],
  ["WRITING", "الكتابة"],
] as const;

export default async function StudentCertificateReportPage({ params }: PageProps<"/report/[certificateId]">) {
  const { certificateId } = await params;
  const session = await prisma.studentTestSession.findUnique({
    where: { certificateId },
    include: { student: { select: { fullName: true, gradeLevel: true } }, test: { select: { title: true } } },
  });
  if (!session || session.status !== SessionStatus.GRADED) notFound();
  const scores = {
    LISTENING: session.listeningScore === null ? null : Number(session.listeningScore),
    SPEAKING: session.speakingScore === null ? null : Number(session.speakingScore),
    READING: session.readingScore === null ? null : Number(session.readingScore),
    WRITING: session.writingScore === null ? null : Number(session.writingScore),
  };
  return (
    <main dir="rtl" className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="mx-auto max-w-4xl space-y-5">
        <div className="flex justify-between print:hidden"><Link href="/" className="text-sm font-bold text-emerald-800">منصة سين</Link><PrintButton /></div>
        <article className="overflow-hidden rounded-3xl border bg-white shadow-sm print:border-0 print:shadow-none">
          <header className="bg-emerald-900 p-8 text-white">
            <p className="text-emerald-200 font-bold">SEEN PLATFORM · CERTIFICATE</p>
            <h1 className="mt-2 text-3xl font-black">تقرير تقييم اللغة الإنجليزية</h1>
            <p className="mt-2">{session.test.title}</p>
          </header>
          <div className="space-y-8 p-6 sm:p-9">
            <section className="grid gap-5 sm:grid-cols-3">
              <div><p className="text-sm text-slate-500">اسم الطالبة</p><p className="mt-1 font-extrabold">{session.student.fullName}</p></div>
              <div><p className="text-sm text-slate-500">الصف الدراسي</p><p className="mt-1 font-extrabold">{session.student.gradeLevel ?? "غير محدد"}</p></div>
              <div><p className="text-sm text-slate-500">تاريخ الإنجاز</p><p className="mt-1 font-extrabold">{session.completedAt?.toLocaleDateString("ar")}</p></div>
            </section>
            <section className="rounded-2xl bg-emerald-50 p-6 text-center">
              <p className="text-sm font-bold text-emerald-900">مستوى CEFR التقديري</p>
              <p className="mt-2 text-4xl font-black text-emerald-900">{session.cefrLevel}</p>
              <p className="mt-2 text-xl font-bold">{Number(session.totalScore).toFixed(1)}%</p>
              <p className="mt-2 text-xs text-slate-600">المستوى إرشادي وفق نتائج هذا الاختبار وليس اعتمادًا رسميًا من جهة خارجية.</p>
            </section>
            <section>
              <h2 className="text-xl font-extrabold">نتائج المهارات</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {skills.map(([key, label]) => {
                  const score = scores[key];
                  return <div key={key} className="rounded-xl border p-4"><div className="flex justify-between font-bold"><span>{label}</span><span>{score === null ? "غير مقاسة" : `${score.toFixed(1)}%`}</span></div>{score !== null && <div className="mt-3 h-2 rounded bg-slate-100"><div className="h-2 rounded bg-emerald-700" style={{ width: `${score}%` }} /></div>}</div>;
                })}
              </div>
            </section>
            <footer className="flex flex-wrap items-center justify-between gap-5 border-t pt-5">
              <div><p className="text-sm font-bold">رمز التحقق</p><p className="font-mono text-emerald-800">{certificateId}</p><p className="text-xs text-slate-500">امسح الرمز للتحقق من التقرير</p></div>
              <QrImage value={`/report/${certificateId}`} label="رمز QR للتحقق من الشهادة" />
            </footer>
          </div>
        </article>
      </div>
    </main>
  );
}
