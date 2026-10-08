"use client";

import React, { useState } from "react";
import {
Plus,
Search,
QrCode,
Calendar,
Copy,
Check,
Mic,
PenTool,
Clock,
Trash2,
Edit3
} from "lucide-react";

export default function QuestionBankAndSchedulePage() {
const [copiedCode, setCopiedCode] = useState(false);
const [selectedSkillFilter, setSelectedSkillFilter] = useState("ALL");
const testAccessPin = "SEEN-9821";

const handleCopyPin = () => {
navigator.clipboard.writeText(testAccessPin);
setCopiedCode(true);
setTimeout(() => setCopiedCode(false), 2000);
};

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
<a href="/admin/questions" className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-[#0d5f2a] text-white transition-colors">
<span>بنك الأسئلة والجدولة وQR</span>
</a>
<a href="/admin/studio" className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors">
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
<h1 className="text-xl sm:text-2xl font-black text-slate-900">بنك الأسئلة وجدولة النماذج الاختبارية</h1>
<p className="text-xs text-slate-500 mt-0.5">إدارة نماذج المهارات الأربع وتوليد رموز المرور وباركود QR المباشر</p>
</div>

<button
onClick={() => alert("إضافة سؤال جديد إلى بنك الأسئلة وفق معايير CEFR.")}
className="px-4 py-2.5 bg-[#0d5f2a] hover:bg-[#09451e] text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
>
<Plus className="w-4 h-4" />
<span>إضافة سؤال جديد</span>
</button>
</header>

<main className="p-6 sm:p-8 space-y-8 flex-1">
<div className="bg-gradient-to-br from-emerald-900 to-[#0d5f2a] text-white p-6 sm:p-8 rounded-3xl shadow-lg relative overflow-hidden">
<div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
<div className="lg:col-span-8 space-y-4">
<div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-bold backdrop-blur-sm border border-white/20">
<Calendar className="w-3.5 h-3.5 text-emerald-300" />
الاختبار النشط حالياً في المدرسة
</div>

<h2 className="text-2xl sm:text-3xl font-black">اختبار تحديد الكفاءة الفصلي SEEN-Term2</h2>
<p className="text-xs sm:text-sm text-emerald-100 leading-relaxed max-w-2xl">
نموذج شامل يغطي المهارات الأربع (Listening, Speaking, Reading, Writing) مع تصحيح ذكي فوري ورصد النتيجة في السجل الأكاديمي.
</p>

<div className="flex flex-wrap items-center gap-4 pt-2">
<div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/20 flex items-center gap-3">
<span className="text-xs text-emerald-200">رمز الدخول للطالبات (PIN):</span>
<span className="font-mono text-lg font-black tracking-wider text-white">{testAccessPin}</span>
<button
onClick={handleCopyPin}
className="p-1.5 hover:bg-white/20 rounded-lg transition-colors text-white cursor-pointer"
title="نسخ الرمز"
>
{copiedCode ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
</button>
</div>

<div className="flex items-center gap-2 text-xs text-emerald-200">
<Clock className="w-4 h-4" />
<span>المدة: <strong>45 دقيقة</strong></span>
</div>
</div>
</div>

<div className="lg:col-span-4 flex flex-col items-center justify-center">
<div className="bg-white p-4 rounded-2xl shadow-xl flex flex-col items-center text-center">
<div className="w-36 h-36 bg-slate-900 rounded-xl flex items-center justify-center p-2">
<QrCode className="w-32 h-32 text-white" />
</div>
<span className="text-slate-900 font-extrabold text-xs mt-2.5">امسحي للدخول الفوري</span>
<span className="text-slate-400 text-[10px]">seen.edu.sa/exam/{testAccessPin}</span>
</div>
</div>

</div>
</div>

<div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
<div className="flex flex-col sm:flex-row items-center justify-between gap-4">
<div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0">
<button
onClick={() => setSelectedSkillFilter("ALL")}
className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
selectedSkillFilter === "ALL" ? "bg-[#0d5f2a] text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
}`}
>
الكل (24 سؤال)
</button>
<button
onClick={() => setSelectedSkillFilter("LISTENING")}
className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
selectedSkillFilter === "LISTENING" ? "bg-[#0d5f2a] text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
}`}
>
الاستماع (Listening)
</button>
<button
onClick={() => setSelectedSkillFilter("SPEAKING")}
className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
selectedSkillFilter === "SPEAKING" ? "bg-[#0d5f2a] text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
}`}
>
التحدث (Speaking)
</button>
<button
onClick={() => setSelectedSkillFilter("READING")}
className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
selectedSkillFilter === "READING" ? "bg-[#0d5f2a] text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
}`}
>
القراءة (Reading)
</button>
<button
onClick={() => setSelectedSkillFilter("WRITING")}
className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
selectedSkillFilter === "WRITING" ? "bg-[#0d5f2a] text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
}`}
>
الكتابة (Writing)
</button>
</div>

<div className="relative w-full sm:w-64">
<Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
<input
type="text"
placeholder="بحث في محتوى الأسئلة..."
className="w-full pr-9 pl-3 py-2 rounded-xl border border-slate-200 text-xs outline-none focus:border-[#0d5f2a]"
/>
</div>
</div>

<div className="divide-y divide-slate-100 space-y-4 pt-2">
<div className="pt-4 flex flex-col sm:flex-row items-start justify-between gap-4">
<div className="flex items-start gap-3">
<div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#0d5f2a] flex items-center justify-center flex-shrink-0 mt-0.5">
<Mic className="w-5 h-5" />
</div>
<div>
<div className="flex items-center gap-2 mb-1">
<span className="font-bold text-xs text-slate-900">سؤال مهارة التحدث (Audio Prompt)</span>
<span className="text-[11px] font-extrabold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">Level B1</span>
<span className="text-[11px] text-slate-400">الوزن: 5 درجات</span>
</div>
<p className="text-xs text-slate-600 leading-relaxed font-sans" dir="ltr">
"Describe a memorable school event or project that inspired you. Explain what happened, your personal contribution, and what you learned from it."
</p>
<p className="text-[11px] text-slate-400 mt-1">معايير التصحيح: طلاقة النطق الصوتي، عدم التردد، وتنوع المفردات الأكاديمية.</p>
</div>
</div>

<div className="flex items-center gap-2 self-end sm:self-center">
<button className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer">
<Edit3 className="w-4 h-4" />
</button>
<button className="p-2 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 cursor-pointer">
<Trash2 className="w-4 h-4" />
</button>
</div>
</div>

<div className="pt-4 flex flex-col sm:flex-row items-start justify-between gap-4">
<div className="flex items-start gap-3">
<div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#0d5f2a] flex items-center justify-center flex-shrink-0 mt-0.5">
<PenTool className="w-5 h-5" />
</div>
<div>
<div className="flex items-center gap-2 mb-1">
<span className="font-bold text-xs text-slate-900">سؤال المقال والتعبير (Academic Essay)</span>
<span className="text-[11px] font-extrabold px-2 py-0.5 rounded bg-[#0d5f2a]/10 text-[#0d5f2a]">Level B2</span>
<span className="text-[11px] text-slate-400">الوزن: 10 درجات</span>
</div>
<p className="text-xs text-slate-600 leading-relaxed font-sans" dir="ltr">
"Write an essay (120–150 words) discussing the benefits and drawbacks of using artificial intelligence tools in modern classrooms."
</p>
<p className="text-[11px] text-slate-400 mt-1">الضوابط: منع اللصق مفعل تلقائياً، تدقيق نحوي ومعجمي وترابط عبر GPT-4o.</p>
</div>
</div>

<div className="flex items-center gap-2 self-end sm:self-center">
<button className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer">
<Edit3 className="w-4 h-4" />
</button>
<button className="p-2 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 cursor-pointer">
<Trash2 className="w-4 h-4" />
</button>
</div>
</div>

</div>

</div>

</main>
</div>
</div>
);
} 