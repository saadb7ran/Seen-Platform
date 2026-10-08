"use client";

import React from "react";
import { 
  Users, 
  Award, 
  CheckCircle, 
  TrendingUp, 
  BarChart3, 
  Clock, 
  Sparkles,
  QrCode,
  FileCheck2,
  ChevronLeft,
  Cpu
} from "lucide-react";
import Link from "next/link";

export default function AdminDashboardPage() {
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
            <Link 
              href="/admin/dashboard" 
              className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-[#0d5f2a] text-white transition-colors"
            >
              <BarChart3 className="w-4 h-4" />
              <span>لوحة التحليلات والإحصاء</span>
            </Link>

            <Link 
              href="/admin/questions" 
              className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <QrCode className="w-4 h-4" />
              <span>بنك الأسئلة والجدولة وQR</span>
            </Link>

            <Link 
              href="/admin/studio" 
              className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <Cpu className="w-4 h-4" />
              <span>استوديو التصحيح الآلي AI</span>
            </Link>

            <Link 
              href="/report/SN-CEFR-2025-9821A" 
              className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <FileCheck2 className="w-4 h-4" />
              <span>الشهادات وتقارير CEFR</span>
            </Link>
          </nav>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
          <p className="text-[11px] text-slate-400 font-medium">المدرسة المسجلة:</p>
          <p className="font-bold text-slate-800">الثانوية التاسعة والعشرون</p>
          <div className="mt-2 pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
            <span>أ. سارة المنصور</span>
            <span className="text-[#0d5f2a] font-bold">مشرفة النظام</span>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        
        <header className="h-20 bg-white border-b border-slate-200/90 px-6 sm:px-8 flex items-center justify-between sticky top-0 z-30">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">لوحة تحكم المعلمة والمؤشرات الأكاديمية</h1>
            <p className="text-xs text-slate-500 mt-0.5">متابعة جلسات اختبار تحديد المستوى CEFR ونتائج التصحيح الآلي الفوري</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-[#0d5f2a] border border-emerald-200 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>محرك الذكاء الاصطناعي: 100% تلقائي</span>
            </div>
          </div>
        </header>

        <main className="p-6 sm:p-8 space-y-8 flex-1">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">إجمالي الطالبات المسجلات</span>
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#0d5f2a] flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl sm:text-3xl font-black text-slate-900">348</span>
                <span className="text-xs font-bold text-emerald-600 flex items-center">
                  +14% <TrendingUp className="w-3 h-3 mr-0.5" />
                </span>
              </div>
              <p className="text-[11px] text-slate-400">موزعات على الصفوف (10 - 11 - 12)</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">الاختبارات المكتملة والمصححة</span>
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <CheckCircle className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl sm:text-3xl font-black text-slate-900">312</span>
                <span className="text-xs font-bold text-emerald-600">89.6% نسبة الإنجاز</span>
              </div>
              <p className="text-[11px] text-slate-400">تم اعتماد مستويات CEFR آلياً</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">متوسط المستوى العام للمدرسة</span>
                <div className="w-9 h-9 rounded-xl bg-purple-50 text-indigo-600 flex items-center justify-center">
                  <Award className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl sm:text-3xl font-black text-indigo-700">Level B1</span>
                <span className="text-xs font-bold text-indigo-600">68.4% متوسط المهارات</span>
              </div>
              <p className="text-[11px] text-slate-400">المعيار المستهدف للعام: B2</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">الجلسات الجارية حالياً</span>
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl sm:text-3xl font-black text-amber-600">36</span>
                <span className="text-xs font-bold text-amber-600 animate-pulse">● مباشر بالصف</span>
              </div>
              <p className="text-[11px] text-slate-400">تحت إشراف المعلمات بالقاعات</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-slate-900">توزيع الطالبات وفق مستويات CEFR</h3>
                <span className="text-xs font-semibold text-slate-400">312 طالبة</span>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-[#0d5f2a]">B2 (Upper-Intermediate)</span>
                    <span>24% (75 طالبة)</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="bg-[#0d5f2a] h-full rounded-full" style={{ width: "24%" }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-indigo-600">B1 (Intermediate)</span>
                    <span>46% (143 طالبة)</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="bg-indigo-600 h-full rounded-full" style={{ width: "46%" }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-sky-600">A2 (Elementary)</span>
                    <span>22% (69 طالبة)</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="bg-sky-600 h-full rounded-full" style={{ width: "22%" }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-amber-600">A1 (Beginner)</span>
                    <span>8% (25 طالبة)</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="bg-amber-600 h-full rounded-full" style={{ width: "8%" }}></div>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
                <span>المهارة الأعلى أداءً: <strong>القراءة (Reading) 78%</strong></span>
                <span>المهارة التي تحتاج دعماً: <strong>التحدث (Speaking) 61%</strong></span>
              </div>
            </div>

            <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-slate-900">سجل نتائج الطالبات المعتمدة آلياً</h3>
                  <p className="text-xs text-slate-400">آخر التقييمات المرصودة من محرك التصحيح الذكي</p>
                </div>
                <Link 
                  href="/admin/questions" 
                  className="text-xs font-bold text-[#0d5f2a] hover:underline flex items-center gap-1"
                >
                  <span>عرض الكل</span>
                  <ChevronLeft className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-right">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 font-bold">
                      <th className="pb-3 pr-2">اسم الطالبة</th>
                      <th className="pb-3">الصف</th>
                      <th className="pb-3 text-center">الدرجة الكلية</th>
                      <th className="pb-3 text-center">مستوى CEFR</th>
                      <th className="pb-3 text-center">حالة التصحيح</th>
                      <th className="pb-3 text-left pl-2">الشهادة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="py-3 pr-2 font-bold text-slate-900">سارة فهد العتيبي</td>
                      <td className="py-3 text-slate-500">ثالث ثانوي (12)</td>
                      <td className="py-3 text-center font-bold text-slate-800">88.5%</td>
                      <td className="py-3 text-center">
                        <span className="px-2 py-0.5 rounded font-extrabold bg-emerald-100 text-[#0d5f2a]">
                          B2 Upper
                        </span>
                      </td>
                      <td className="py-3 text-center text-emerald-600 font-bold">✓ معتمد آلياً</td>
                      <td className="py-3 text-left pl-2">
                        <Link href="/report/SN-CEFR-2025-9821A" className="text-[#0d5f2a] font-bold hover:underline">
                          عرض
                        </Link>
                      </td>
                    </tr>

                    <tr>
                      <td className="py-3 pr-2 font-bold text-slate-900">نورة محمد السبيعي</td>
                      <td className="py-3 text-slate-500">ثاني ثانوي (11)</td>
                      <td className="py-3 text-center font-bold text-slate-800">74.0%</td>
                      <td className="py-3 text-center">
                        <span className="px-2 py-0.5 rounded font-extrabold bg-indigo-100 text-indigo-700">
                          B1 Inter
                        </span>
                      </td>
                      <td className="py-3 text-center text-emerald-600 font-bold">✓ معتمد آلياً</td>
                      <td className="py-3 text-left pl-2">
                        <Link href="/report/SN-CEFR-2025-9821A" className="text-[#0d5f2a] font-bold hover:underline">
                          عرض
                        </Link>
                      </td>
                    </tr>

                    <tr>
                      <td className="py-3 pr-2 font-bold text-slate-900">جنى سلطان الدوسري</td>
                      <td className="py-3 text-slate-500">أول ثانوي (10)</td>
                      <td className="py-3 text-center font-bold text-slate-800">56.5%</td>
                      <td className="py-3 text-center">
                        <span className="px-2 py-0.5 rounded font-extrabold bg-sky-100 text-sky-700">
                          A2 Elem
                        </span>
                      </td>
                      <td className="py-3 text-center text-emerald-600 font-bold">✓ معتمد آلياً</td>
                      <td className="py-3 text-left pl-2">
                        <Link href="/report/SN-CEFR-2025-9821A" className="text-[#0d5f2a] font-bold hover:underline">
                          عرض
                        </Link>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

          </div>

        </main>
      </div>
    </div>
  );
}