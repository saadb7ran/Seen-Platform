"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  function openExam(event: FormEvent) {
    event.preventDefault();
    const normalized = code.trim().toUpperCase();
    if (normalized) router.push(`/exam/${encodeURIComponent(normalized)}`);
  }
  return (
    <main dir="rtl" className="min-h-screen bg-gradient-to-br from-emerald-950 to-emerald-700 text-white flex items-center justify-center p-6">
      <section className="max-w-2xl w-full text-center space-y-8">
        <div>
          <p className="text-emerald-200 font-bold">SEEN PLATFORM</p>
          <h1 className="mt-3 text-4xl sm:text-6xl font-black">منصة سين لتقييم اللغة الإنجليزية</h1>
          <p className="mt-4 text-emerald-100">اختبارات المهارات الأربع، نتائج موثقة، وتقارير مستوى CEFR.</p>
        </div>
        <form onSubmit={openExam} className="mx-auto flex max-w-lg gap-2 rounded-2xl bg-white p-2">
          <input value={code} onChange={(event) => setCode(event.target.value)} placeholder="أدخل رمز الاختبار" aria-label="رمز الاختبار" className="min-w-0 flex-1 rounded-xl px-3 text-slate-900 outline-none" />
          <button className="rounded-xl bg-emerald-800 px-5 py-3 font-bold">الانتقال للاختبار</button>
        </form>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link href="/register" className="rounded-xl bg-white px-5 py-3 font-bold text-emerald-900">إنشاء حساب طالبة</Link>
          <Link href="/login" className="rounded-xl border border-white/40 px-5 py-3 font-bold">تسجيل الدخول</Link>
          <Link href="/account" className="rounded-xl border border-white/40 px-5 py-3 font-bold">حساب الطالبة</Link>
          <Link href="/admin/dashboard" className="rounded-xl border border-white/40 px-5 py-3 font-bold">لوحة الإدارة</Link>
        </div>
      </section>
    </main>
  );
}
