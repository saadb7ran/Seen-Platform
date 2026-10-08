"use client";

import React, { useState } from "react";
import { 
  Mic, 
  PenTool, 
  Play, 
  Square, 
  CheckCircle2
} from "lucide-react";

export default function AiScoringStudioPage() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speakingScoreOverride] = useState("8.5");
  const [writingScoreOverride] = useState("9.0");

  return (
    <div className="min-h-screen bg-[#f8f9ff] text-slate-800 flex" dir="rtl">
      
      <aside className="w-64 bg-white border-l border-slate-200 hidden md:flex flex-col justify-between p-5 sticky top-0 h-screen">
        <div className="space-y-6">
          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 rounded-xl bg-[#0d5f2a] text-white flex items-center justify-center font-bold text-xl">
              س
            </div>
            <div>
              <h2 className="font-bold text-base text-slate-900 leading-tight">منصة سين</h2>
              <p className="text-[11px] text-slate-400 font-mono">SEEN ENGINE v2.4</p>
            </div>
          </div>

          <nav className="space-y-1.5 text-xs font-bold">
            <a href="/admin/dashboard" className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors">
              <span>لوحة التحليلات والإحصاء</span>
            </a>
            <a href="/admin/questions" className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors">
              <span>بنك الأسئلة والجدولة وQR</span>
            </a>
            <a href="/admin/studio" className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-[#0d5f2a] text-white transition-colors">
              <span>استوديو التصحيح الآلي AI</span>
            </a>
            <a href="/report/SN-CEFR-2025-9821A" className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors">
              <span>الشهادات وتقارير CEFR</span>
            </a>
          </nav>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        
        <header className="h-20 bg-white border-b border-slate-200 px-6 sm:px-8 flex items-center justify-between sticky top-0 z-30">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900">استوديو ومحرك التصحيح الذكي</h1>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-[#0d5f2a] text-xs font-extrabold">
                100% Automated
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">مراجعة التحليل الصوتي للـ Whisper والتحليل اللغوي لـ GPT-4o مع إمكانية الاعتماد الفوري</p>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => alert("تم اعتماد ومزامنة جميع نتائج الجلسة آلياً.")}
              className="px-4 py-2 bg-[#0d5f2a] hover:bg-[#09451e] text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>اعتماد النتائج للشعبة</span>
            </button>
          </div>
        </header>

        <main className="p-6 sm:p-8 space-y-8 flex-1">
          
          <div className="bg-white p-5 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#0d5f2a]/10 border border-[#0d5f2a]/20 text-[#0d5f2a] flex items-center justify-center font-bold text-lg">
                س
              </div>
              <div>
                <h2 className="font-extrabold text-base text-slate-900">سارة فهد العتيبي</h2>
                <p className="text-xs text-slate-500">الصف: الثالث الثانوي (12/أ) | رمز الجلسة: #SN-9821</p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs font-bold">
              <div className="text-left">
                <span className="text-slate-400 block text-[10px]">المستوى التقديري المقترح</span>
                <span className="text-[#0d5f2a] text-base font-black">Level B2 (Upper)</span>
              </div>
              <div className="text-left">
                <span className="text-slate-400 block text-[10px]">معدل الدقة الإجمالية</span>
                <span className="text-indigo-600 text-base font-black">88.5%</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#0d5f2a] flex items-center justify-center">
                    <Mic className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">تحليل مهارة التحدث (Speaking)</h3>
                    <p className="text-[11px] text-slate-400">OpenAI Whisper + Acoustic Metrics</p>
                  </div>
                </div>
                <span className="text-xs font-extrabold text-[#0d5f2a] bg-emerald-50 px-2 py-0.5 rounded">
                  الدرجة: {speakingScoreOverride} / 10
                </span>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="w-10 h-10 rounded-full bg-[#0d5f2a] text-white flex items-center justify-center hover:bg-[#09451e] transition-colors cursor-pointer"
                    >
                      {isPlaying ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4 mr-0.5" />}
                    </button>
                    <div>
                      <p className="text-xs font-bold text-slate-800">تسجيل إجابة الطالبة الصوتية</p>
                      <p className="text-[11px] text-slate-400">ملف: student_rec_sarah_q2.webm (00:48)</p>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-600">00:48</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex justify-between">
                  <span>التفريغ الصوتي الآلي (Automated Speech-to-Text):</span>
                  <span className="text-emerald-600 text-[11px]">دقة المطابقة 98%</span>
                </label>
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 leading-relaxed font-sans" dir="ltr">
                  "Last semester, our class organized a science fair about renewable energy. My main role was presenting solar panels efficiency to the jury. I learned how to explain complex concepts clearly and gained tremendous confidence."
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-400 text-[11px] block">الطلاقة وسرعة الإلقاء</span>
                  <strong className="text-slate-800">128 كلمة / دقيقة (ممتاز)</strong>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-400 text-[11px] block">وضوح النطق الصوتي (Phonetics)</span>
                  <strong className="text-emerald-700">89% مطابقة للمعايير</strong>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#0d5f2a] flex items-center justify-center">
                    <PenTool className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">تحليل مهارة الكتابة (Writing)</h3>
                    <p className="text-[11px] text-slate-400">GPT-4o Rubric Evaluation</p>
                  </div>
                </div>
                <span className="text-xs font-extrabold text-[#0d5f2a] bg-emerald-50 px-2 py-0.5 rounded">
                  الدرجة: {writingScoreOverride} / 10
                </span>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex justify-between">
                  <span>نص المقال المكتوب من الطالبة (134 كلمة):</span>
                  <span className="text-emerald-600 text-[11px]">مطابق للنطاق المطلوب</span>
                </label>
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 leading-relaxed font-sans max-h-40 overflow-y-auto" dir="ltr">
                  "Artificial intelligence tools offer significant opportunities in education today. First, they allow students to receive personalized explanations at any hour. However, excessive reliance on automated assistants may hinder critical thinking skills. Therefore, teachers should guide learners to utilize these technologies constructively."
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between font-bold text-slate-700">
                  <span>الصحة النحوية (Grammatical Accuracy):</span>
                  <span className="text-emerald-700">9.0 / 10</span>
                </div>
                <div className="flex justify-between font-bold text-slate-700">
                  <span>التنوع المعجمي والأكاديمي (Lexical Resource):</span>
                  <span className="text-emerald-700">8.5 / 10</span>
                </div>
                <div className="flex justify-between font-bold text-slate-700">
                  <span>الترابط وتناسق الأفكار (Coherence & Cohesion):</span>
                  <span className="text-emerald-700">9.0 / 10</span>
                </div>
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-[#0d5f2a]">
                <strong>التغذية الراجعة الذكية:</strong> استخدام سليم لأدوات الربط (First, However, Therefore). تم تسجيل تنوع ممتاز في المفردات ومطابقة دقيقة لمستوى B2.
              </div>
            </div>

          </div>

        </main>
      </div>
    </div>
  );
}