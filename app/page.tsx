"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  ShieldCheck, 
  Sparkles, 
  Headphones, 
  Mic, 
  BookOpen, 
  PenTool, 
  CheckCircle2, 
  KeyRound,
  GraduationCap
} from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const [accessCode, setAccessCode] = useState("");
  const [studentName, setStudentName] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleStartExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim()) {
      setError("يرجى كتابة الاسم الثلاثي للطالبة للمتابعة.");
      return;
    }
    if (!accessCode.trim() || accessCode.length < 5) {
      setError("يرجى إدخال رمز اختبار صحيح مكوّن من 6 أرقام أو حروف.");
      return;
    }
    setIsLoading(true);
    setError("");
    router.push(`/exam/${accessCode.trim().toUpperCase()}`);
  };

  return (
    <div className="min-h-screen bg-[#f8f9ff] text-slate-800 flex flex-col justify-between" dir="rtl">
      {/* الشريط العلوي */}
      <header className="border-b border-slate-200/80 bg-white/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#0d5f2a]/10 border border-[#0d5f2a]/20 flex items-center justify-center font-bold text-2xl text-[#0d5f2a]">
              س
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl text-[#0d5f2a] tracking-tight">منصة سين</span>
                <span className="text-xs bg-[#0d5f2a]/10 text-[#0d5f2a] px-2 py-0.5 rounded-full font-semibold border border-[#0d5f2a]/20">
                  Seen Platform
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">Seen Academic Assessment Engine</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-emerald-50 text-[#0d5f2a] border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse"></span>
              محرك التصحيح الآلي 100% نشط
            </span>
            <a 
              href="/admin/dashboard" 
              className="text-xs font-bold text-slate-700 hover:text-[#0d5f2a] px-3.5 py-2 rounded-xl hover:bg-slate-100 transition-all flex items-center gap-1.5 border border-slate-200"
            >
              <GraduationCap className="w-4 h-4 text-[#0d5f2a]" />
              بوابة المعلمات والإدارة
            </a>
          </div>
        </div>
      </header>

      {/* المحتوى الرئيسي */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0d5f2a]/10 text-[#0d5f2a] text-xs font-bold border border-[#0d5f2a]/20">
              <Sparkles className="w-3.5 h-3.5" />
              المعيار الأكاديمي القياسي لمعايير CEFR (A1 - B2)
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 leading-tight">
              التقييم الذكي المباشر لمهارات اللغة الإنجليزية 
              <span className="text-[#0d5f2a] block mt-1">لطالبات المرحلة الثانوية</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
              منظومة تقييم متقدمة تدعم مهارات الاستماع، التحدث، القراءة، والكتابة بأسلوب اختبارات كامبريدج وIELTS العالمية، مع تصحيح فوري مدعوم بالذكاء الاصطناعي دون أي تدخل بشري.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center text-center">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#0d5f2a] flex items-center justify-center mb-2">
                  <Headphones className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-slate-800">الاستماع</span>
                <span className="text-[11px] text-slate-500">Listening</span>
              </div>

              <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center text-center">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#0d5f2a] flex items-center justify-center mb-2">
                  <Mic className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-slate-800">التحدث</span>
                <span className="text-[11px] text-slate-500">Speaking</span>
              </div>

              <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center text-center">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#0d5f2a] flex items-center justify-center mb-2">
                  <BookOpen className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-slate-800">القراءة</span>
                <span className="text-[11px] text-slate-500">Reading</span>
              </div>

              <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center text-center">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#0d5f2a] flex items-center justify-center mb-2">
                  <PenTool className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-slate-800">الكتابة</span>
                <span className="text-[11px] text-slate-500">Writing</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-6 text-xs text-slate-500 pt-2 font-medium">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> تقرير فوري ورادار مهارات CEFR
              </span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" /> شهادة معتمدة ومزودة برمز QR
              </span>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-xl shadow-slate-200/50 relative overflow-hidden">
              <div className="absolute top-0 right-0 left-0 h-2 bg-gradient-to-r from-[#0d5f2a] via-[#10b981] to-[#0d5f2a]" />
              
              <div className="mb-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-emerald-50 text-[#0d5f2a] font-bold text-xs mb-2">
                  <KeyRound className="w-3.5 h-3.5" />
                  بوابة دخول جلسة الاختبار
                </div>
                <h2 className="text-2xl font-bold text-slate-900">بدء اختبار الكفاءة</h2>
                <p className="text-xs text-slate-500 mt-1">
                  أدخلي بياناتك ورمز المرور (PIN) المسلّم لك من قبل المعلمة.
                </p>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-bold text-red-700 flex items-center gap-2">
                  <span>⚠️</span> {error}
                </div>
              )}

              <form onSubmit={handleStartExam} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    الاسم الكامل للطالبة
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: ريم عبدالله القحطاني"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#0d5f2a] focus:ring-2 focus:ring-[#0d5f2a]/20 outline-none text-sm transition-all text-slate-900 placeholder:text-slate-400 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 flex justify-between">
                    <span>رمز الاختبار السريع (Access PIN)</span>
                    <span className="text-slate-400 font-normal">6 خانات</span>
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={10}
                    placeholder="مثال: SEEN-89"
                    value={accessCode}
                    onChange={(e) => setAccessCode(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#0d5f2a] focus:ring-2 focus:ring-[#0d5f2a]/20 outline-none text-sm font-mono tracking-wider uppercase transition-all text-slate-900 placeholder:text-slate-400 font-bold"
                  />
                </div>

                <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-[11px] text-slate-500 space-y-1">
                  <p className="font-semibold text-slate-700">توجيهات قبل البدء:</p>
                  <p>• تأكدي من توصيل سماعة الرأس لمهارتي الاستماع والتحدث.</p>
                  <p>• يستغرق الاختبار ما يقارب 35 إلى 45 دقيقة متواصلة.</p>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 px-6 rounded-xl bg-[#0d5f2a] hover:bg-[#09451e] text-white font-bold text-sm shadow-lg shadow-[#0d5f2a]/20 transition-all flex items-center justify-center gap-2 group disabled:opacity-70 cursor-pointer"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      جاري التحقق والدخول...
                    </span>
                  ) : (
                    <>
                      <span>بدء الاختبار المباشر الآن</span>
                      <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

        </div>
      </main>

      <footer className="border-t border-slate-200 bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-slate-500 font-medium space-y-1">
          <p>© 2025 منصة سين (Seen Academic Assessment Engine) — جميع الحقوق محفوظة لتقييم الكفاءة اللغوية.</p>
          <p className="text-[11px] text-slate-400">مهندسة وفق الإطار الأوروبي المشترك للغات (CEFR Standards v2024)</p>
        </div>
      </footer>
    </div>
  );
}
