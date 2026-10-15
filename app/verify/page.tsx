'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Search, ShieldCheck } from 'lucide-react';

export default function VerifyCertificatePage() {
  const router = useRouter();
  const [code, setCode] = useState('');

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalizedCode = code.trim().toUpperCase();
    if (!normalizedCode) return;
    router.push(`/verify/${encodeURIComponent(normalizedCode)}`);
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
      <section className="max-w-lg w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl text-center">
        <div className="w-14 h-14 rounded-2xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center mx-auto mb-5 text-teal-400">
          <ShieldCheck className="w-7 h-7" />
        </div>
        <h1 className="text-2xl font-black text-white">التحقق من الشهادة</h1>
        <p className="text-sm text-slate-400 mt-2 mb-6">
          أدخل رمز التحقق الظاهر على الشهادة للتحقق من تسجيلها.
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
          <input
            aria-label="رمز التحقق"
            autoComplete="off"
            required
            maxLength={64}
            value={code}
            onChange={(event) => setCode(event.target.value)}
            placeholder="SEEN-2026-..."
            className="min-w-0 flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-teal-500"
          />
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl text-sm transition-all"
          >
            <Search className="w-4 h-4" />
            تحقق
            <ArrowLeft className="w-4 h-4" />
          </button>
        </form>
        <Link href="/" className="inline-flex mt-6 text-xs font-semibold text-teal-400 hover:underline">
          العودة إلى المنصة
        </Link>
        <footer className="text-[10px] text-slate-500 mt-8">
          <p>جميع الحقوق محفوظة © 2026 - منصة سين لتحديد مستوى اللغة الإنجليزية (CEFR)</p>
          <p className="text-holst-sage font-semibold mt-1">تصميم وتطوير: الأستاذ سعد القرني</p>
        </footer>
      </section>
    </main>
  );
}
