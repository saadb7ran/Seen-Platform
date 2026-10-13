import Link from 'next/link';
import { BookOpen, Award, Sparkles, ShieldCheck, ArrowLeft, CheckCircle2, Headphones, FileText } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-teal-500 selection:text-white">
      
      {/* Top Header Navigation */}
      <header className="max-w-7xl w-full mx-auto px-6 py-6 flex items-center justify-between border-b border-slate-900">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-teal-500/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-xl font-black tracking-tight text-white">Seen <span className="text-teal-400">Platform</span></span>
            <span className="block text-[10px] text-slate-400 tracking-wider">منصة تقييم اللغة الإنجليزية (CEFR)</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link 
            href="/verify/SEEN-2026-SAMPLE"
            className="text-xs font-medium text-slate-300 hover:text-teal-400 transition-colors hidden sm:inline-flex items-center gap-1.5"
          >
            <ShieldCheck className="w-4 h-4 text-teal-400" />
            التحقق من الشهادات
          </Link>
          <Link
            href="/test/sample"
            className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-semibold text-sm transition-all shadow-lg shadow-teal-900/30"
          >
            بدء التجربة
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-5xl mx-auto px-6 py-16 md:py-24 text-center flex flex-col items-center my-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-500/10 text-teal-400 text-xs font-semibold mb-8 border border-teal-500/20">
          <Sparkles className="w-3.5 h-3.5" />
          مبنية وفق الإطار الأوروبي المرجعي للغات (CEFR A1 - C2)
        </div>

        <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-tight max-w-3xl">
          قيّم مهاراتك الإنجليزية بدقة فائقة مع <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-400">منصة سين</span>
        </h1>

        <p className="text-slate-400 text-base md:text-lg mt-6 max-w-2xl leading-relaxed">
          نظام اختبارات متكامل ومؤمن بالكامل، يدعم الصوتيات المتقدمة، التصحيح الفوري، وإصدار شهادات معتمدة وموثوقة برمز تحقق فريد.
        </p>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-4xl mt-12 text-right">
          <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800/80">
            <BookOpen className="w-6 h-6 text-teal-400 mb-2" />
            <h3 className="font-bold text-sm text-slate-200">القراءة والمفردات</h3>
            <p className="text-xs text-slate-400 mt-1">نصوص متقدمة تقيس الفهم العميق.</p>
          </div>
          <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800/80">
            <Headphones className="w-6 h-6 text-teal-400 mb-2" />
            <h3 className="font-bold text-sm text-slate-200">الاستماع الآمن</h3>
            <p className="text-xs text-slate-400 mt-1">مشغل صوتي مشفر وحصري.</p>
          </div>
          <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800/80">
            <ShieldCheck className="w-6 h-6 text-teal-400 mb-2" />
            <h3 className="font-bold text-sm text-slate-200">شهادات موثوقة</h3>
            <p className="text-xs text-slate-400 mt-1">رمز تحقق QR خاص لكل شهادة.</p>
          </div>
          <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800/80">
            <FileText className="w-6 h-6 text-teal-400 mb-2" />
            <h3 className="font-bold text-sm text-slate-200">تقارير المهارات</h3>
            <p className="text-xs text-slate-400 mt-1">تحليل شامل لنتائج المهارات الأربع.</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 mt-10">
          <Link
            href="/test/sample"
            className="px-8 py-3.5 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl transition-all shadow-xl shadow-teal-900/40 flex items-center gap-2"
          >
            <span>ابدأ الاختبار الآن</span>
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <Link
            href="/verify/SEEN-2026-SAMPLE"
            className="px-8 py-3.5 bg-slate-900 hover:bg-slate-800 text-slate-200 font-bold rounded-xl border border-slate-800 transition-all"
          >
            التحقق من وثيقة
          </Link>
        </div>
      </section>

      {/* Global Footer with Strict Attribution */}
      <footer className="w-full text-center py-6 border-t border-slate-900 text-xs text-slate-500 mt-auto flex flex-col items-center gap-2 px-6">
        <p>جميع الحقوق محفوظة © 2026 - منصة سين لتحديد مستوى اللغة الإنجليزية (CEFR)</p>
        <p className="text-teal-400 font-semibold bg-slate-900 px-4 py-1.5 rounded-full border border-slate-800 shadow-sm">
          تصميم وتطوير: الأستاذ سعد القرني
        </p>
      </footer>

    </main>
  );
}