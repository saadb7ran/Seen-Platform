'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Timer, Headphones, BookOpen, ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';

interface TestPageProps {
  params: Promise<{
    id: string;
  }>;
}

interface TestQuestion {
  id: string;
  skill: string;
  level: string;
  prompt: string;
  passage: string | null;
  audioUrl: string | null;
  options: string[];
}

interface ActiveTest {
  sessionId: string;
  examTitle: string;
  startedAt: string;
  durationMin: number;
  questions: TestQuestion[];
}

function AttributionFooter() {
  return (
    <footer className="w-full text-center py-4 border-t border-slate-900 text-xs text-slate-500 flex flex-col items-center gap-1">
      <p>جميع الحقوق محفوظة © 2026 - منصة سين لتحديد مستوى اللغة الإنجليزية (CEFR)</p>
      <p className="text-holst-sage font-semibold bg-slate-900 px-3 py-1 rounded-full border border-slate-800 text-[10px]">
        تصميم وتطوير: الأستاذ سعد القرني
      </p>
    </footer>
  );
}

function isActiveTest(value: unknown): value is ActiveTest {
  if (!value || typeof value !== 'object') return false;
  const test = value as Record<string, unknown>;
  return (
    typeof test.sessionId === 'string' &&
    typeof test.examTitle === 'string' &&
    typeof test.startedAt === 'string' &&
    typeof test.durationMin === 'number' &&
    Array.isArray(test.questions) &&
    test.questions.length > 0 &&
    test.questions.every((question: unknown) => {
      if (!question || typeof question !== 'object') return false;
      const item = question as Record<string, unknown>;
      return (
        typeof item.id === 'string' &&
        typeof item.skill === 'string' &&
        typeof item.level === 'string' &&
        typeof item.prompt === 'string' &&
        (typeof item.passage === 'string' || item.passage === null) &&
        (typeof item.audioUrl === 'string' || item.audioUrl === null) &&
        Array.isArray(item.options) &&
        item.options.every((option: unknown) => typeof option === 'string')
      );
    })
  );
}

export default function TestInterface({ params }: TestPageProps) {
  const testId = React.use(params).id;
  const router = useRouter();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [test, setTest] = useState<ActiveTest | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isStarting, setIsStarting] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const submitAttempted = useRef(false);

  useEffect(() => {
    let active = true;
    const startTest = async () => {
      try {
        const response = await fetch(`/api/tests/${encodeURIComponent(testId)}`, {
          method: 'POST',
        });
        if (response.status === 401) {
          router.replace(`/auth?next=${encodeURIComponent(`/test/${testId}`)}`);
          return;
        }
        const result: unknown = await response.json();
        if (!response.ok) {
          const message =
            result && typeof result === 'object' && 'error' in result &&
            typeof result.error === 'string'
              ? result.error
              : 'تعذر بدء الاختبار.';
          throw new Error(message);
        }
        if (!isActiveTest(result)) throw new Error('استجابة الاختبار غير صالحة.');
        if (active) setTest(result);
      } catch (startError) {
        if (active) {
          console.error('Could not start test:', startError);
          setError(startError instanceof Error ? startError.message : 'تعذر بدء الاختبار.');
        }
      } finally {
        if (active) setIsStarting(false);
      }
    };

    void startTest();
    return () => {
      active = false;
    };
  }, [router, testId]);

  const handleOptionSelect = (option: string) => {
    const question = test?.questions[currentQuestionIndex];
    if (!question || isSubmitting) return;
    setAnswers((current) => ({ ...current, [question.id]: option }));
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${String(secs).padStart(2, '0')}`;
  };

  const handleNext = () => {
    if (test && currentQuestionIndex < test.questions.length - 1) {
      setCurrentQuestionIndex((current) => current + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((current) => current - 1);
    }
  };

  const handleSubmitTest = useCallback(async () => {
    if (!test || submitAttempted.current) return;
    submitAttempted.current = true;
    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/submit-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: test.sessionId, answers }),
      });
      const result: unknown = await response.json();
      if (!response.ok) {
        const message =
          result && typeof result === 'object' && 'error' in result &&
          typeof result.error === 'string'
            ? result.error
            : 'تعذر تسليم الاختبار.';
        if (response.status !== 410) submitAttempted.current = false;
        throw new Error(message);
      }
      if (
        !result ||
        typeof result !== 'object' ||
        !('certificate' in result) ||
        !result.certificate ||
        typeof result.certificate !== 'object' ||
        !('verificationCode' in result.certificate) ||
        typeof result.certificate.verificationCode !== 'string'
      ) {
        submitAttempted.current = false;
        throw new Error('تعذر تأكيد نتيجة الاختبار.');
      }

      setVerificationCode(result.certificate.verificationCode);
      setIsSubmitted(true);
    } catch (submitError) {
      console.error('Could not submit test:', submitError);
      if (timeLeft !== 0) submitAttempted.current = false;
      setError(submitError instanceof Error ? submitError.message : 'تعذر تسليم الاختبار.');
    } finally {
      setIsSubmitting(false);
    }
  }, [answers, test, timeLeft]);

  useEffect(() => {
    if (!test) return;
    const expiresAt = new Date(test.startedAt).getTime() + test.durationMin * 60_000;
    const updateRemainingTime = () => {
      setTimeLeft(Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000)));
    };
    updateRemainingTime();
    const timer = setInterval(updateRemainingTime, 1000);
    return () => clearInterval(timer);
  }, [test]);

  useEffect(() => {
    if (timeLeft === 0 && test && !submitAttempted.current) {
      void handleSubmitTest();
    }
  }, [handleSubmitTest, test, timeLeft]);

  if (isStarting) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center" aria-live="polite">
        <p className="text-center p-6">جارٍ تحميل الاختبار...</p>
        <AttributionFooter />
      </main>
    );
  }

  if (!test) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6 text-center">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8">
          <h1 className="text-xl font-bold text-white">تعذر فتح الاختبار</h1>
          <p role="alert" className="text-sm text-slate-300 mt-3">{error}</p>
          <Link
            href={`/auth?next=${encodeURIComponent(`/test/${testId}`)}`}
            className="inline-flex mt-6 text-sm font-semibold text-teal-400 hover:underline"
          >
            تسجيل الدخول
          </Link>
        </div>
        <AttributionFooter />
      </main>
    );
  }

  if (isSubmitted) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl">
          <div className="w-16 h-16 bg-teal-500/20 text-teal-400 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-teal-500/30">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-white">تم تسليم الاختبار بنجاح!</h1>
          <p className="text-sm text-slate-400 mt-2 mb-6">
            تم تصحيح إجاباتك على الخادم، وأُصدرت شهادة مرتبطة بنتيجتك الفعلية.
          </p>
          <Link
            href={`/verify/${encodeURIComponent(verificationCode)}`}
            className="block w-full py-3 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-teal-900/40"
          >
            عرض الشهادة والتحقق منها
          </Link>
        </div>
        <AttributionFooter />
      </main>
    );
  }

  return (
    <main aria-label={`اختبار ${testId}`} className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-teal-500 selection:text-white">
      
      {/* Focus Mode Header (Server Timer & Progress) */}
      <header className="max-w-4xl w-full mx-auto px-6 py-4 flex items-center justify-between border-b border-slate-900 bg-slate-900/50 backdrop-blur-md rounded-b-2xl">
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 bg-teal-500/10 border border-teal-500/30 text-teal-400 font-bold text-xs rounded-xl">
            {test.examTitle}
          </span>
          <span className="text-xs text-slate-400">
            السؤال {currentQuestionIndex + 1} من {test.questions.length}
          </span>
        </div>

        {/* Live Server Timer */}
        <div className="flex items-center gap-2 px-4 py-1.5 bg-slate-800 border border-slate-700/80 rounded-xl text-holst-sand font-mono font-bold text-sm">
          <Timer className="w-4 h-4" />
          <span>{formatTime(timeLeft ?? 0)}</span>
        </div>
      </header>

      {/* Test Content Area (Focus Mode - Clean & Distraction Free) */}
      <section className="max-w-3xl w-full mx-auto px-6 py-10 my-auto">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-10 shadow-xl">
          {error && (
            <p role="alert" className="mb-5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-xs text-rose-300">
              {error}
            </p>
          )}
          {timeLeft === 0 && (
            <p role="status" className="mb-5 text-xs text-holst-sand">انتهى وقت الاختبار، جارٍ تسليم الإجابات.</p>
          )}
          
          {/* Passage or Audio Component if available */}
          {test.questions[currentQuestionIndex].passage && (
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 mb-6 text-sm text-slate-300 leading-relaxed font-sans">
              <div className="flex items-center gap-2 text-teal-400 font-bold mb-2 text-xs">
                <BookOpen className="w-4 h-4" /> قطعة القراءة النصية
              </div>
              {test.questions[currentQuestionIndex].passage}
            </div>
          )}

          {test.questions[currentQuestionIndex].audioUrl && (
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 mb-6 flex flex-col gap-3">
              <div className="flex items-center gap-2 text-teal-400 font-bold text-xs">
                <Headphones className="w-4 h-4" /> مقطع الاستماع المشفر (صوت آمن)
              </div>
              <audio controls controlsList="nodownload" className="w-full accent-teal-500">
                <source src={test.questions[currentQuestionIndex].audioUrl ?? ''} />
                متصفحك لا يدعم مشغل الصوت.
              </audio>
            </div>
          )}

          {/* Question Prompt */}
          <h2 className="text-lg md:text-xl font-bold text-white mb-6 leading-snug">
            {test.questions[currentQuestionIndex].prompt}
          </h2>

          {/* Options Grid */}
          <div className="space-y-3">
            {test.questions[currentQuestionIndex].options.map((option, idx) => {
              const isSelected = answers[test.questions[currentQuestionIndex].id] === option;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleOptionSelect(option)}
                  disabled={isSubmitting || timeLeft === 0}
                  className={`w-full text-right p-4 rounded-2xl border transition-all text-sm font-medium flex items-center justify-between cursor-pointer ${
                    isSelected
                      ? 'bg-teal-600/10 border-teal-500 text-teal-300 shadow-lg'
                      : 'bg-slate-950/60 border-slate-800 hover:bg-slate-800 text-slate-300'
                  }`}
                >
                  <span>{option}</span>
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                    isSelected ? 'border-teal-400 bg-teal-500 text-white' : 'border-slate-700'
                  }`}>
                    {isSelected && <span className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-800">
            <button
              onClick={handlePrev}
              disabled={currentQuestionIndex === 0}
              className={`px-5 py-2.5 rounded-xl font-semibold text-xs transition-all flex items-center gap-2 ${
                currentQuestionIndex === 0
                  ? 'opacity-40 cursor-not-allowed bg-slate-800 text-slate-500'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
              }`}
            >
              <ArrowRight className="w-4 h-4" />
              <span>السؤال السابق</span>
            </button>

            {currentQuestionIndex < test.questions.length - 1 ? (
              <button
                type="button"
                onClick={handleNext}
                disabled={timeLeft === 0 || isSubmitting}
                className="px-6 py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl text-xs transition-all shadow-md flex items-center gap-2"
              >
                <span>السؤال التالي</span>
                <ArrowLeft className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmitTest}
                disabled={isSubmitting || timeLeft === 0}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white font-bold rounded-xl text-xs transition-all shadow-md flex items-center gap-2"
              >
                <span>{isSubmitting ? 'جارٍ التصحيح...' : 'إنهاء وتسليم الاختبار'}</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>
            )}
          </div>

        </div>
      </section>

      <AttributionFooter />

    </main>
  );
}
