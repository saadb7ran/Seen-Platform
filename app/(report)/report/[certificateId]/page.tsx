"use client";

import React from "react";
import { 
  Award, 
  Printer, 
  ArrowLeft, 
  ShieldCheck, 
  Sparkles,
  QrCode
} from "lucide-react";
import { useParams } from "next/navigation";
import Link from "next/link";

export default function StudentCertificateReportPage() {
  const params = useParams();
  const certId = (params.certificateId as string) || "SN-CEFR-2025-9821A";

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#f8f9ff] text-slate-800 py-10 px-4 sm:px-6 lg:px-8 font-sans" dir="rtl">
      
      <div className="max-w-4xl mx-auto mb-6 flex items-center justify-between print:hidden">
        <Link 
          href="/admin/dashboard" 
          className="text-xs font-bold text-slate-600 hover:text-[#0d5f2a] flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 rotate-180" />
          <span>العودة للوحة التحكم</span>
        </Link>

        <div className="flex items-center gap-3">
          <button 
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4 text-[#0d5f2a]" />
            <span>طباعة الشهادة الرسمية</span>
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden print:border-none print:shadow-none">
        
        <div className="bg-gradient-to-r from-[#0d5f2a] via-[#0f7635] to-[#0d5f2a] text-white p-8 sm:p-10 relative">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-right">
            
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-xs font-bold">
                <ShieldCheck className="w-4 h-4 text-emerald-300" />
                شهادة معتمدة لتقييم كفاءة مهارات اللغة الإنجليزية
              </div>
              <h1 className="text-2xl sm:text-3xl font-black">منصة سين الأكاديمية | SEEN PLATFORM</h1>
              <p className="text-xs sm:text-sm text-emerald-100">
                Seen Academic Assessment Engine — Official CEFR Diagnostic Certification
              </p>
            </div>

            <div className="w-24 h-24 rounded-full bg-white/10 backdrop-blur-md border-2 border-white/30 flex flex-col items-center justify-center text-center p-2">
              <Award className="w-8 h-8 text-emerald-300 mb-1" />
              <span className="text-[10px] font-bold tracking-tight">VERIFIED CEFR</span>
              <span className="text-[9px] text-emerald-200 font-mono">STANDARDS</span>
            </div>

          </div>
        </div>

        <div className="p-8 sm:p-10 space-y-8">
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 p-6 rounded-2xl bg-[#f8f9ff] border border-slate-200/80">
            <div>
              <span className="text-[11px] text-slate-400 font-bold block mb-1">اسم الطالبة المرشحة:</span>
              <h3 className="text-base font-extrabold text-slate-900">سارة فهد العتيبي</h3>
              <p className="text-xs text-slate-500 font-sans" dir="ltr">Sarah Fahad Al-Otaibi</p>
            </div>

            <div>
              <span className="text-[11px] text-slate-400 font-bold block mb-1">المدرسة والمرحلة:</span>
              <h4 className="text-sm font-bold text-slate-800">الثانوية التاسعة والعشرون</h4>
              <p className="text-xs text-slate-500">الصف الثالث الثانوي (مسار عام)</p>
            </div>

            <div>
              <span className="text-[11px] text-slate-400 font-bold block mb-1">رقم الوثيقة الأكاديمية:</span>
              <span className="font-mono text-sm font-black text-[#0d5f2a] block">{certId}</span>
              <p className="text-[11px] text-slate-400">تاريخ الإصدار: 15 مارس 2025</p>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-right">
            <div>
              <span className="text-xs font-bold text-[#0d5f2a] block mb-1">المستوى المحقق وفق الإطار الأوروبي المشترك (CEFR):</span>
              <h2 className="text-3xl font-black text-[#0d5f2a]">Level B2 — فوق المتوسط (Upper-Intermediate)</h2>
              <p className="text-xs text-slate-600 mt-1 max-w-xl">
                تظهر الطالبة قدرة عالية على فهم الأفكار الأساسية للنصوص المعقدة والتواصل بطلاقة وعفوية دون تكلف ملحوظ.
              </p>
            </div>

            <div className="px-6 py-4 rounded-2xl bg-white shadow-sm border border-emerald-100 text-center">
              <span className="text-[11px] text-slate-400 font-bold block">الدرجة الموزونة الكلية</span>
              <span className="text-3xl font-black text-[#0d5f2a]">88.5%</span>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-extrabold text-sm text-slate-900">تفكيك مهارات الكفاءة اللغوية الأربع:</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-2">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-slate-800">1. مهارة الاستماع (Listening)</span>
                  <span className="text-[#0d5f2a]">90.0% (Level B2)</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="bg-[#0d5f2a] h-full rounded-full" style={{ width: "90%" }}></div>
                </div>
                <p className="text-[11px] text-slate-500">فهم ممتاز للمحاضرات والنقاشات الطويلة باللكنة القياسية.</p>
              </div>

              <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-2">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-slate-800">2. مهارة التحدث (Speaking)</span>
                  <span className="text-indigo-600">85.0% (Level B2)</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="bg-indigo-600 h-full rounded-full" style={{ width: "85%" }}></div>
                </div>
                <p className="text-[11px] text-slate-500">إلقاء صوتي متدفق، نطق واضح، وسرعة 128 كلمة بالدقيقة.</p>
              </div>

              <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-2">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-slate-800">3. مهارة القراءة (Reading)</span>
                  <span className="text-[#0d5f2a]">92.0% (Level B2)</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="bg-[#0d5f2a] h-full rounded-full" style={{ width: "92%" }}></div>
                </div>
                <p className="text-[11px] text-slate-500">استيعاب سريع للمصطلحات العلمية وسياق المقالات الأكاديمية.</p>
              </div>

              <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-2">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-slate-800">4. مهارة الكتابة (Writing)</span>
                  <span className="text-indigo-600">87.0% (Level B2)</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="bg-indigo-600 h-full rounded-full" style={{ width: "87%" }}></div>
                </div>
                <p className="text-[11px] text-slate-500">هيكل مقالي متماسك، استخدام سليم لأدوات الربط وتنوع معجمي غني.</p>
              </div>

            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <h4 className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#0d5f2a]" />
              توصيات محرك الذكاء الاصطناعي لمواصلة التقدم (Path to C1 Advanced):
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              • التوسع في قراءة المقالات الأكاديمية المتخصصة لتنمية المفردات الاصطلاحية (Idiomatic Expressions).<br />
              • المشاركة في المناظرات اللغوية الصفية لرفع مستوى التحدث التلقائي في المواقف غير المتوقعة.
            </p>
          </div>

          <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-6">
            
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-slate-900 rounded-xl p-1.5 flex items-center justify-center">
                <QrCode className="w-16 h-16 text-white" />
              </div>
              <div className="text-xs">
                <span className="font-bold text-slate-800 block">رمز التحقق الإلكتروني المعتمد</span>
                <span className="text-slate-400 font-mono text-[11px]">seen.edu.sa/verify/{certId}</span>
                <p className="text-[10px] text-emerald-700 font-semibold mt-1">✓ وثيقة إلكترونية رسمية صادرة آلياً</p>
              </div>
            </div>

            <div className="text-center sm:text-left space-y-1">
              <p className="text-xs font-bold text-slate-800">إدارة التعليم / قسم اللغة الإنجليزية</p>
              <p className="text-[11px] text-slate-500">منظومة تقييم مهارات اللغة الإنجليزية لطالبات المرحلة الثانوية</p>
              <div className="font-serif italic font-bold text-slate-700 text-sm pt-1">Seen Assessment Council</div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}