'use client';

import Link from 'next/link';
import { ShieldCheck, Award, Printer } from 'lucide-react';

interface VerifyPageProps {
  certificate: {
    verificationCode: string;
    cefrLevel: string;
    overallScore: number;
    issuedAt: string;
    user: { name: string };
  } | null;
  requestedCode: string;
}

export default function CertificateVerification({ certificate, requestedCode }: VerifyPageProps) {
  const handlePrint = () => {
    window.print();
  };

  if (!certificate) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-xl w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto mb-6 text-slate-400">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-white">تعذر التحقق من الشهادة</h1>
          <p className="text-sm text-slate-300 mt-3">
            لم نعثر على شهادة مكتملة ومسجلة بهذا الرمز.
          </p>
          <p className="font-mono text-xs text-slate-500 mt-4 break-all">{requestedCode}</p>
          <Link href="/" className="inline-flex mt-6 text-sm font-semibold text-teal-400 hover:underline">
            العودة إلى منصة سين
          </Link>
        </div>
        <footer className="mt-6 text-center text-xs text-slate-500">
          <p>جميع الحقوق محفوظة © 2026 - منصة سين لتحديد مستوى اللغة الإنجليزية (CEFR)</p>
          <p className="text-holst-sage font-semibold mt-1">تصميم وتطوير: الأستاذ سعد القرني</p>
        </footer>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-6 print:bg-white print:text-black print:p-0">
      
      {/* Header bar - Hidden on print */}
      <div className="max-w-4xl w-full mx-auto flex items-center justify-between mb-8 print:hidden">
        <Link href="/" className="text-xs font-semibold text-teal-400 hover:underline">
          ← العودة لمنصة سين
        </Link>
        <button
          onClick={handlePrint}
          className="px-5 py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 transition-all shadow-lg cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          <span>طباعة / حفظ كـ PDF</span>
        </button>
      </div>

      {/* Official Certificate Card */}
      <div className="max-w-3xl w-full mx-auto bg-slate-900 border-2 border-teal-500/40 rounded-3xl p-10 shadow-2xl relative print:border-2 print:border-black print:shadow-none print:bg-white print:text-black">
        
        {/* Seal Badge */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-white print:text-black">
              Seen <span className="text-teal-400 print:text-teal-700">Platform</span>
            </h1>
            <p className="text-xs text-slate-400 print:text-slate-600 mt-1">
              وثيقة إثبات كفاءة مسجلة في اللغة الإنجليزية (CEFR)
            </p>
          </div>
          <div className="w-16 h-16 rounded-2xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 print:text-teal-700 print:border-teal-700">
            <Award className="w-8 h-8" />
          </div>
        </div>

        {/* Certificate Body */}
        <div className="space-y-6 text-center my-10">
          <p className="text-xs text-slate-400 print:text-slate-600 uppercase tracking-widest">
            Official Assessment Certificate / شهادة تقييم رسمية
          </p>
          <p className="text-sm text-slate-300 print:text-slate-700">تشهد منصة سين بأن المختبر/ة:</p>
          <h2 className="text-2xl font-black text-white print:text-black">{certificate.user.name}</h2>
          <p className="text-sm text-slate-300 print:text-slate-700">
            قد أتم/ت اختبار تحديد المستوى المعياري وحقق/ت النتيجة التالية:
          </p>

          <div className="inline-flex items-center gap-4 bg-slate-950 border border-slate-800 px-8 py-4 rounded-2xl print:bg-slate-100 print:border-slate-300">
            <div>
              <span className="block text-[10px] text-slate-400 print:text-slate-600">المستوى المحقق</span>
              <span className="text-3xl font-black text-teal-400 print:text-teal-700">{certificate.cefrLevel}</span>
            </div>
            <div className="w-px h-8 bg-slate-800 print:bg-slate-300" />
            <div>
              <span className="block text-[10px] text-slate-400 print:text-slate-600">النسبة المئوية</span>
              <span className="text-2xl font-bold text-white print:text-black">{Math.round(certificate.overallScore)}%</span>
            </div>
          </div>
        </div>

        {/* Verification Metadata */}
        <div className="border-t border-slate-800 print:border-slate-300 pt-6 grid grid-cols-2 gap-4 text-xs">
          <div>
            <span className="block text-[10px] text-slate-500 print:text-slate-600 mb-1">رمز التحقق الفريد:</span>
            <span className="font-mono font-bold text-teal-400 print:text-black break-all">{certificate.verificationCode}</span>
          </div>
          <div className="text-left dir-ltr">
            <span className="block text-[10px] text-slate-500 print:text-slate-600 mb-1">حالة التوثيق:</span>
            <span className="inline-flex items-center gap-1 text-emerald-400 print:text-emerald-700 font-bold">
              <ShieldCheck className="w-3.5 h-3.5" /> موثوقة ومسجلة
            </span>
          </div>
        </div>

        {/* Footer Attribution */}
        <div className="mt-8 pt-4 border-t border-slate-800/60 print:border-slate-200 text-center text-[10px] text-slate-500 print:text-slate-600">
          <p>صدرت بتاريخ: {certificate.issuedAt} · تصميم وتطوير المنصة: الأستاذ سعد القرني</p>
          <p className="mt-1">جميع الحقوق محفوظة © 2026 - منصة سين لتحديد مستوى اللغة الإنجليزية (CEFR)</p>
        </div>

      </div>

      <div className="h-4" />
    </main>
  );
}