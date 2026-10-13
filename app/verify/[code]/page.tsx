'use client';

import React from 'react';
import { ShieldCheck, Award, User, Calendar, FileText, Printer } from 'lucide-react';

interface VerifyPageProps {
  params: Promise<{
    code: string;
  }>;
}

export default async function VerifyCertificatePage({ params }: VerifyPageProps) {
  const resolvedParams = await params;
  const code = resolvedParams.code ? resolvedParams.code.toUpperCase() : "SAMPLE";

  const certificateData = {
    code: code,
    studentName: "سارة محمد العتيبي",
    cefrLevel: "B2",
    levelDescription: "Upper-Intermediate (مستوى متقدم متوسط)",
    overallScore: "88%",
    skills: {
      reading: "90%",
      listening: "85%",
      grammar: "92%",
      vocabulary: "85%"
    },
    issuedDate: "12 أكتوبر 2026",
    issuer: "منصة سين لتحديد المستوى (Seen Platform)"
  };

  return (
    <>
      {/* CSS مخصص لضبط الطباعة وجعل الشهادة تملأ صفحة الـ PDF بالكامل بدون مساحات فارغة */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 10mm;
          }
          body {
            background-color: white !important;
            color: black !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .print\:hidden {
            display: none !important;
          }
          .certificate-container {
            width: 100% !important;
            max-width: 100% !important;
            border: 2px solid #0d9488 !important;
            box-shadow: none !important;
            margin: 0 !important;
            padding: 20px !important;
            page-break-after: avoid;
            page-break-inside: avoid;
          }
        }
      `}</style>

      <main className="min-h-screen bg-slate-100 text-slate-800 flex flex-col justify-between p-4 md:p-8 selection:bg-teal-500 selection:text-white">
        
        {/* Top Action Bar (Hidden during print) */}
        <div className="max-w-3xl w-full mx-auto flex justify-end mb-4 print:hidden">
          <button
            onClick={() => window.print()}
            className="px-5 py-2.5 bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>طباعة الشهادة / حفظ PDF</span>
          </button>
        </div>

        {/* Certificate Box */}
        <div className="certificate-container max-w-3xl w-full mx-auto my-auto bg-white border-2 border-teal-700/30 rounded-3xl p-6 md:p-10 shadow-2xl relative overflow-hidden">
          
          {/* Watermark effect */}
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none">
            <span className="text-9xl font-black tracking-widest text-teal-900">SEEN</span>
          </div>

          {/* Verification Status Banner */}
          <div className="flex items-center gap-4 bg-teal-50 border border-teal-200 p-4 rounded-2xl text-teal-800 mb-6">
            <div className="p-2.5 bg-teal-600 text-white rounded-xl">
              <ShieldCheck className="w-6 h-6 flex-shrink-0" />
            </div>
            <div>
              <h1 className="font-bold text-base text-teal-900">وثيقة رسمية معتمدة وموثقة</h1>
              <p className="text-xs text-teal-700 mt-0.5">تم التحقق من صحة هذه الشهادة برمجياً من السجلات الرقمية لمنصة سين</p>
            </div>
          </div>

          {/* Header Branding */}
          <div className="flex flex-col md:flex-row items-center justify-between border-b-2 border-slate-200 pb-5 mb-6 gap-4 text-center md:text-right">
            <div>
              <h2 className="text-2xl font-black tracking-tight text-slate-900">Seen <span className="text-teal-600">Platform</span></h2>
              <p className="text-xs font-medium text-slate-500 mt-1">منصة تقييم واختبارات اللغة الإنجليزية وفق الإطار الأوروبي (CEFR)</p>
            </div>
            <div className="px-4 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs font-mono text-slate-700 flex items-center gap-2">
              <FileText className="w-4 h-4 text-teal-600" />
              <span>ID: {certificateData.code}</span>
            </div>
          </div>

          {/* Main Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col justify-center">
              <span className="text-slate-500 text-xs flex items-center gap-1.5 mb-1 font-medium"><User className="w-4 h-4 text-teal-600"/> اسم الحاصلة على الشهادة</span>
              <span className="font-extrabold text-lg text-slate-900">{certificateData.studentName}</span>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col justify-center">
              <span className="text-slate-500 text-xs flex items-center gap-1.5 mb-1 font-medium"><Award className="w-4 h-4 text-teal-600"/> المستوى المعياري المكتسب (CEFR)</span>
              <div className="flex items-center gap-3">
                <span className="font-black text-xl text-teal-700">{certificateData.cefrLevel}</span>
                <span className="text-xs font-semibold text-slate-700 bg-teal-100 px-2.5 py-0.5 rounded-lg border border-teal-200">{certificateData.levelDescription}</span>
              </div>
            </div>
          </div>

          {/* Skills Breakdown */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 mb-6">
            <span className="text-xs font-bold text-slate-700 block mb-3">تفاصيل تقييم المهارات اللغوية:</span>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-white p-3 rounded-xl text-center border border-slate-200 shadow-sm">
                <span className="block text-xs text-slate-500 font-medium">القراءة (Reading)</span>
                <span className="block font-black text-teal-700 text-base mt-1">{certificateData.skills.reading}</span>
              </div>
              <div className="bg-white p-3 rounded-xl text-center border border-slate-200 shadow-sm">
                <span className="block text-xs text-slate-500 font-medium">الاستماع (Listening)</span>
                <span className="block font-black text-teal-700 text-base mt-1">{certificateData.skills.listening}</span>
              </div>
              <div className="bg-white p-3 rounded-xl text-center border border-slate-200 shadow-sm">
                <span className="block text-xs text-slate-500 font-medium">القواعد (Grammar)</span>
                <span className="block font-black text-teal-700 text-base mt-1">{certificateData.skills.grammar}</span>
              </div>
              <div className="bg-white p-3 rounded-xl text-center border border-slate-200 shadow-sm">
                <span className="block text-xs text-slate-500 font-medium">المفردات (Vocabulary)</span>
                <span className="block font-black text-teal-700 text-base mt-1">{certificateData.skills.vocabulary}</span>
              </div>
            </div>
          </div>

          {/* Footer info inside card */}
          <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-slate-600 border-t border-slate-200 pt-4 gap-2">
            <span className="flex items-center gap-1.5 font-medium"><Calendar className="w-4 h-4 text-teal-600" /> تاريخ الإصدار: {certificateData.issuedDate}</span>
            <span className="text-teal-800 font-bold bg-teal-50 px-3 py-1 rounded-lg border border-teal-200">الدرجة الكلية: {certificateData.overallScore}</span>
          </div>

        </div>

        {/* Global Footer with Design Attribution */}
        <footer className="w-full text-center py-6 border-t border-slate-200 text-xs text-slate-600 mt-8 flex flex-col items-center gap-1.5 print:hidden">
          <p>جميع الحقوق محفوظة © 2026 - منصة سين لتحديد مستوى اللغة الإنجليزية (CEFR)</p>
          <p className="text-teal-700 font-bold bg-white px-4 py-1.5 rounded-full border border-slate-200 shadow-sm">
            تصميم وتطوير: الأستاذ سعد القرني
          </p>
        </footer>
      </main>
    </>
  );
}