import { Suspense } from 'react';
import TestInterface from './test-interface';

interface TestPageProps {
  params: Promise<{ id: string }>;
}

export default function TestPage({ params }: TestPageProps) {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center">
          <p className="text-center p-6" aria-live="polite">جارٍ تحميل الاختبار...</p>
          <footer className="mt-auto w-full text-center py-4 border-t border-slate-900 text-xs text-slate-500">
            <p>جميع الحقوق محفوظة © 2026 - منصة سين لتحديد مستوى اللغة الإنجليزية (CEFR)</p>
            <p className="text-holst-sage font-semibold mt-1">تصميم وتطوير: الأستاذ سعد القرني</p>
          </footer>
        </main>
      }
    >
      <TestInterface params={params} />
    </Suspense>
  );
}
