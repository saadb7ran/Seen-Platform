'use client';

import React, { useState, useEffect } from 'react';
import { Timer, Headphones, BookOpen, ArrowLeft, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';

interface TestPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function TestInterfacePage({ params }: TestPageProps) {
  const [resolvedId, setResolvedId] = useState<string>('sample');
  
  // حالة الأسئلة والاختبار
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [timeLeft, setTimeLeft] = useState(45 * 60); // 45 دقيقة بالثواني
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    params.then((p) => setResolvedId(p.id));
  }, [params]);

  // مؤقت الوقت التنازلي
  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  // محاكاة بيانات الأسئلة (القراءة والاستماع والقواعد)
  const questions = [
    {
      id: 1,
      skill: "READING",
      title: "Reading Comprehension",
      passage: "Read the following passage carefully and choose the correct answer: \n\n'Renewable energy sources such as solar and wind power are becoming increasingly vital for global sustainability. Governments around the world are investing heavily in reducing carbon footprints and transitioning away from fossil fuels.'",
      prompt: "What is the primary focus of the passage?",
      options: [
        "The high cost of fossil fuels",
        "The importance of renewable energy and sustainability",
        "How solar panels are manufactured",
        "The history of global governments"
      ],
      correctAnswer: "The importance of renewable energy and sustainability"
    },
    {
      id: 2,
      skill: "LISTENING",
      title: "Listening Section",
      hasAudio: true,
      audioUrl: "#", // رابط مشفر من Supabase Storage مستقبلاً
      prompt: "Listen to the audio clip. What does the speaker suggest doing?",
      options: [
        "Postponing the meeting until next week",
        "Submitting the report before Friday morning",
        "Canceling the project entirely",
        "Calling the technical support team"
      ],
      correctAnswer: "Submitting the report before Friday morning"
    },
    {
      id: 3,
      skill: "GRAMMAR",
      title: "Grammar & Structure",
      prompt: "Choose the correct grammatical form: \n'If I _____ about the traffic, I would have taken a different route.'",
      options: [
        "know",
        "had known",
        "have known",
        "knowing"
      ],
      correctAnswer: "had known"
    }
  ];

  const currentQ = questions[currentQuestionIndex];

  const handleOptionSelect = (option: string) => {
    setAnswers({
      ...answers,
      [currentQuestionIndex]: option
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmitTest = () => {
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl">
          <div className="w-16 h-16 bg-teal-500/20 text-teal-400 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-teal-500/30">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-white">تم تسليم الاختبار بنجاح!</h1>
          <p className="text-sm text-slate-400 mt-2 mb-6">
            جاري معالجة إجاباتك عبر النظام الآلي وتصنيف مستواك المعياري وفق معيار CEFR وإصدار الشهادة الموثقة.
          </p>
          <a
            href="/verify/SEEN-2026-X981"
            className="block w-full py-3 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-teal-900/40"
          >
            عرض الشهادة الموثقة
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-teal-500 selection:text-white">
      
      {/* Focus Mode Header (Server Timer & Progress) */}
      <header className="max-w-4xl w-full mx-auto px-6 py-4 flex items-center justify-between border-b border-slate-900 bg-slate-900/50 backdrop-blur-md rounded-b-2xl">
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 bg-teal-500/10 border border-teal-500/30 text-teal-400 font-bold text-xs rounded-xl">
            {currentQ.title}
          </span>
          <span className="text-xs text-slate-400">
            السؤال {currentQuestionIndex + 1} من {questions.length}
          </span>
        </div>

        {/* Live Server Timer */}
        <div className="flex items-center gap-2 px-4 py-1.5 bg-slate-800 border border-slate-700/80 rounded-xl text-amber-400 font-mono font-bold text-sm">
          <Timer className="w-4 h-4" />
          <span>{formatTime(timeLeft)}</span>
        </div>
      </header>

      {/* Test Content Area (Focus Mode - Clean & Distraction Free) */}
      <section className="max-w-3xl w-full mx-auto px-6 py-10 my-auto">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-10 shadow-xl">
          
          {/* Passage or Audio Component if available */}
          {currentQ.passage && (
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 mb-6 text-sm text-slate-300 leading-relaxed font-sans">
              <div className="flex items-center gap-2 text-teal-400 font-bold mb-2 text-xs">
                <BookOpen className="w-4 h-4" /> قطعة القراءة النصية
              </div>
              {currentQ.passage}
            </div>
          )}

          {currentQ.hasAudio && (
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 mb-6 flex flex-col gap-3">
              <div className="flex items-center gap-2 text-teal-400 font-bold text-xs">
                <Headphones className="w-4 h-4" /> مقطع الاستماع المشفر (صوت آمن)
              </div>
              {/* مشغل صوتي محمي */}
              <audio controls controlsList="nodownload" className="w-full accent-teal-500">
                <source src="/sample-audio.mp3" type="audio/mpeg" />
                متصفحك لا يدعم مشغل الصوت.
              </audio>
              <span className="text-[10px] text-slate-500">ملاحظة: التشغيل محدود لعدد مرتين فقط حسب معايير الاختبار.</span>
            </div>
          )}

          {/* Question Prompt */}
          <h2 className="text-lg md:text-xl font-bold text-white mb-6 leading-snug">
            {currentQ.prompt}
          </h2>

          {/* Options Grid */}
          <div className="space-y-3">
            {currentQ.options.map((option, idx) => {
              const isSelected = answers[currentQuestionIndex] === option;
              return (
                <button
                  key={idx}
                  onClick={() => handleOptionSelect(option)}
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

            {currentQuestionIndex < questions.length - 1 ? (
              <button
                onClick={handleNext}
                className="px-6 py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl text-xs transition-all shadow-md flex items-center gap-2"
              >
                <span>السؤال التالي</span>
                <ArrowLeft className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmitTest}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition-all shadow-md flex items-center gap-2"
              >
                <span>إنهاء وتسليم الاختبار</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>
            )}
          </div>

        </div>
      </section>

      {/* Global Footer with Design Attribution */}
      <footer className="w-full text-center py-4 border-t border-slate-900 text-xs text-slate-500 flex flex-col items-center gap-1">
        <p>جميع الحقوق محفوظة © 2026 - منصة سين لتحديد مستوى اللغة الإنجليزية (CEFR)</p>
        <p className="text-teal-400 font-semibold bg-slate-900 px-3 py-1 rounded-full border border-slate-800 text-[10px]">
          تصميم وتطوير: الأستاذ سعد القرني
        </p>
      </footer>

    </main>
  );
}
