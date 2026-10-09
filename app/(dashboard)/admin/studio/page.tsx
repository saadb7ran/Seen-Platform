"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import LogoutButton from "@/app/logout-button";
import { readJsonResponse } from "@/lib/client-http";

type ReviewAnswer = {
  questionId: string;
  question: string;
  skill: string;
  maxScore: number;
  response: string | null;
  score: number;
  feedback: string | null;
};
type ReviewSession = { id: string; student: { fullName: string; username: string }; test: { title: string }; answers: ReviewAnswer[] };

export default function AiScoringStudioPage() {
  const [sessions, setSessions] = useState<ReviewSession[]>([]);
  const [grades, setGrades] = useState<Record<string, Record<string, { score: string; feedback: string }>>>({});
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");

  async function load() {
    const response = await fetch("/api/admin/studio");
    const data = await readJsonResponse<{ sessions?: ReviewSession[] }>(response, "تعذر تحميل التصحيحات.");
    setSessions(data.sessions ?? []);
    setGrades(Object.fromEntries((data.sessions ?? []).map((session) => [session.id, Object.fromEntries(session.answers.map((answer) => [
      answer.questionId,
      { score: String(answer.score), feedback: answer.feedback ?? "" },
    ]))])));
  }

  useEffect(() => {
    queueMicrotask(() => {
      load().catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "تعذر تحميل التصحيحات."));
    });
  }, []);

  async function approve(session: ReviewSession) {
    setBusy(session.id);
    setError("");
    try {
      const response = await fetch("/api/admin/studio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: session.id,
          answers: session.answers.map((answer) => ({
            questionId: answer.questionId,
            score: Number(grades[session.id]?.[answer.questionId]?.score),
            feedback: grades[session.id]?.[answer.questionId]?.feedback,
          })),
        }),
      });
      await readJsonResponse<{ session?: unknown }>(response, "تعذر اعتماد التصحيح.");
      await load();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "تعذر اعتماد التصحيح.");
    } finally {
      setBusy("");
    }
  }

  return (
    <main dir="rtl" className="min-h-screen bg-slate-50 p-5 sm:p-8 space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div><h1 className="text-2xl font-black">مراجعة الإجابات والتصحيح</h1><p className="mt-1 text-sm text-slate-500">تظهر هنا الإجابات المفتوحة التي تحتاج مراجعة عند عدم تفعيل خدمة OpenAI.</p></div>
        <div className="flex gap-3"><Link href="/admin/dashboard" className="rounded-lg border px-4 py-2 text-sm font-bold">لوحة الإدارة</Link><Link href="/admin/questions" className="rounded-lg border px-4 py-2 text-sm font-bold">الاختبارات</Link><LogoutButton /></div>
      </header>
      {error && <p role="alert" className="rounded-xl bg-red-50 p-4 text-red-800">{error}</p>}
      {!sessions.length && <section className="rounded-2xl border bg-white p-6 text-slate-600">لا توجد إجابات بانتظار التصحيح.</section>}
      {sessions.map((session) => <section key={session.id} className="rounded-2xl border bg-white p-5 space-y-5">
        <div><h2 className="font-extrabold">{session.student.fullName} ({session.student.username})</h2><p className="text-sm text-slate-500">{session.test.title}</p></div>
        {session.answers.map((answer) => <article key={answer.questionId} className="border-t pt-4 space-y-3">
          <div><p className="text-xs font-bold text-emerald-800">{answer.skill} · الدرجة القصوى {answer.maxScore}</p><p className="mt-1 font-bold">{answer.question}</p><p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">{answer.response || "لا توجد إجابة نصية مسجلة."}</p></div>
          <div className="grid gap-3 sm:grid-cols-[160px_1fr]">
            <label className="text-sm font-bold">الدرجة<input type="number" min={0} max={answer.maxScore} step="0.1" value={grades[session.id]?.[answer.questionId]?.score ?? "0"} onChange={(event) => setGrades((current) => ({ ...current, [session.id]: { ...current[session.id], [answer.questionId]: { ...current[session.id]?.[answer.questionId], score: event.target.value, feedback: current[session.id]?.[answer.questionId]?.feedback ?? "" } } }))} className="mt-1 w-full rounded-xl border p-2" /></label>
            <label className="text-sm font-bold">ملاحظات التصحيح<textarea rows={2} value={grades[session.id]?.[answer.questionId]?.feedback ?? ""} onChange={(event) => setGrades((current) => ({ ...current, [session.id]: { ...current[session.id], [answer.questionId]: { ...current[session.id]?.[answer.questionId], score: current[session.id]?.[answer.questionId]?.score ?? "0", feedback: event.target.value } } }))} className="mt-1 w-full rounded-xl border p-2 font-normal" /></label>
          </div>
        </article>)}
        <button onClick={() => approve(session)} disabled={busy === session.id} className="rounded-xl bg-emerald-800 px-5 py-3 font-bold text-white disabled:opacity-50">{busy === session.id ? "جارٍ اعتماد النتيجة..." : "اعتماد الدرجات وإصدار الشهادة"}</button>
      </section>)}
    </main>
  );
}
