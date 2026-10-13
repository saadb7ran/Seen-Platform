'use client';

import React, { useState } from 'react';
import { LayoutDashboard, Database, Users, PlusCircle, CheckCircle, ShieldCheck, Sparkles, BookOpen, Trash2 } from 'lucide-react';

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<'stats' | 'questions' | 'students'>('stats');

  // نماذج لبيانات تجريبية لإدارة النظام وبنك الأسئلة
  const [questions, setQuestions] = useState([
    { id: '1', skill: 'READING', level: 'B2', prompt: 'What is the primary focus of renewable energy policies?', answer: 'Sustainability' },
    { id: '2', skill: 'LISTENING', level: 'C1', prompt: 'Identify the speaker tone in corporate negotiation.', answer: 'Assertive' },
    { id: '3', skill: 'GRAMMAR', level: 'B1', prompt: 'Choose the correct past tense for irregular verbs.', answer: 'Had gone' },
  ]);

  const [newPrompt, setNewPrompt] = useState('');
  const [newSkill, setNewSkill] = useState('READING');
  const [newLevel, setNewLevel] = useState('B2');
  const [newAnswer, setNewAnswer] = useState('');

  // حالات وإضافات الذكاء الاصطناعي
  const [isAIGenerating, setIsAIGenerating] = useState(false);

  const handleAIGenerate = async () => {
    setIsAIGenerating(true);
    try {
      const res = await fetch('/api/ai/generate-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skill: newSkill, level: newLevel })
      });
      
      const data = await res.json();
      if (data.success && data.question) {
        setNewPrompt(data.question.prompt);
        setNewAnswer(data.question.correctAnswer);
        alert('تم توليد السؤال بنجاح عبر الذكاء الاصطناعي!');
      } else {
        alert(data.error || 'فشل توليد السؤال');
      }
    } catch (err) {
      console.error(err);
      alert('حدث خطأ أثناء الاتصال بخدمة الذكاء الاصطناعي');
    } finally {
      setIsAIGenerating(false);
    }
  };

  const handleAddQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPrompt || !newAnswer) return;

    const newItem = {
      id: String(questions.length + 1),
      skill: newSkill,
      level: newLevel,
      prompt: newPrompt,
      answer: newAnswer,
    };

    setQuestions([newItem, ...questions]);
    setNewPrompt('');
    setNewAnswer('');
  };

  const handleDeleteQuestion = (id: string) => {
    setQuestions(questions.filter((q) => q.id !== id));
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-teal-500 selection:text-white">
      
      {/* Top Header */}
      <header className="max-w-7xl w-full mx-auto px-6 py-5 flex items-center justify-between border-b border-slate-900 bg-slate-900/50 backdrop-blur-md rounded-b-3xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-teal-500/20">
            <LayoutDashboard className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-white">لوحة تحكم الإدارة <span className="text-teal-400">Seen Admin</span></h1>
            <span className="block text-[10px] text-slate-400">إدارة بنك الأسئلة، الاختبارات، والمختبرين</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/"
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs font-semibold text-slate-300 transition-all"
          >
            العودة للمنصة
          </a>
        </div>
      </header>

      {/* Main Admin Body */}
      <section className="max-w-7xl w-full mx-auto px-6 py-8 my-auto">
        
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 mb-8 bg-slate-900 p-1.5 rounded-2xl border border-slate-800 w-fit">
          <button
            onClick={() => setActiveTab('stats')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'stats' ? 'bg-teal-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>نظرة عامة</span>
          </button>
          <button
            onClick={() => setActiveTab('questions')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'questions' ? 'bg-teal-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>إدارة بنك الأسئلة</span>
          </button>
          <button
            onClick={() => setActiveTab('students')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'students' ? 'bg-teal-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>المستخدمين والصلاحيات</span>
          </button>
        </div>

        {/* Tab 1: Stats Overview */}
        {activeTab === 'stats' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl">
                <span className="text-xs text-slate-400 block mb-1">إجمالي اختبارات اليوم</span>
                <span className="text-3xl font-black text-white">142</span>
                <span className="text-[10px] text-teal-400 mt-2 block">↑ 12% عن الأسبوع الماضي</span>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl">
                <span className="text-xs text-slate-400 block mb-1">الشهادات الصادرة</span>
                <span className="text-3xl font-black text-teal-400">1,280</span>
                <span className="text-[10px] text-slate-500 mt-2 block">موثقة برمز تحقق فريد</span>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl">
                <span className="text-xs text-slate-400 block mb-1">أسئلة بنك المعرفة</span>
                <span className="text-3xl font-black text-white">{questions.length}</span>
                <span className="text-[10px] text-teal-400 mt-2 block">موزعة على مستويات CEFR</span>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl">
                <span className="text-xs text-slate-400 block mb-1">متوسط النجاح العام</span>
                <span className="text-3xl font-black text-emerald-400">84%</span>
                <span className="text-[10px] text-slate-500 mt-2 block">وفق معايير التقييم الأوروبية</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Questions Bank Management */}
        {activeTab === 'questions' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Add New Question Form */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl h-fit">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <PlusCircle className="w-5 h-5 text-teal-400" /> إضافة سؤال جديد
                </h3>
                
                {/* زر توليد الأسئلة بالذكاء الاصطناعي */}
                <button
                  type="button"
                  onClick={handleAIGenerate}
                  disabled={isAIGenerating}
                  className="px-3 py-1.5 bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 border border-teal-500/30 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isAIGenerating ? "جاري التوليد..." : "توليد بالذكاء الاصطناعي"}</span>
                </button>
              </div>

              <form onSubmit={handleAddQuestion} className="space-y-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">المهارة اللغوية</label>
                  <select
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-teal-500"
                  >
                    <option value="READING">قراءة (Reading)</option>
                    <option value="LISTENING">استماع (Listening)</option>
                    <option value="GRAMMAR">قواعد (Grammar)</option>
                    <option value="VOCABULARY">مفردات (Vocabulary)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">المستوى المعياري (CEFR)</label>
                  <select
                    value={newLevel}
                    onChange={(e) => setNewLevel(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-teal-500"
                  >
                    <option value="A1">A1 - Beginner</option>
                    <option value="A2">A2 - Elementary</option>
                    <option value="B1">B1 - Intermediate</option>
                    <option value="B2">B2 - Upper-Intermediate</option>
                    <option value="C1">C1 - Advanced</option>
                    <option value="C2">C2 - Proficient</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">نص السؤال أو الجملة</label>
                  <textarea
                    rows={3}
                    value={newPrompt}
                    onChange={(e) => setNewPrompt(e.target.value)}
                    placeholder="اكتب السؤال هنا..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-teal-500 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">الإجابة الصحيحة</label>
                  <input
                    type="text"
                    value={newAnswer}
                    onChange={(e) => setNewAnswer(e.target.value)}
                    placeholder="الإجابة الصحيحة للتصحيح الآلي"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-teal-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl text-xs transition-all shadow-md cursor-pointer"
                >
                  حفظ وإضافة السؤال للبنك
                </button>
              </form>
            </div>

            {/* Questions Table List */}
            <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-6 rounded-3xl">
              <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-teal-400" /> الأسئلة المسجلة في البنك الحالي
              </h3>
              
              <div className="space-y-3">
                {questions.map((q) => (
                  <div key={q.id} className="bg-slate-950/80 border border-slate-800 p-4 rounded-2xl flex items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2.5 py-0.5 bg-teal-500/10 text-teal-400 font-bold text-[10px] rounded-lg border border-teal-500/20">{q.skill}</span>
                        <span className="px-2.5 py-0.5 bg-slate-800 text-slate-300 font-bold text-[10px] rounded-lg">{q.level}</span>
                      </div>
                      <p className="text-sm text-slate-200 font-medium">{q.prompt}</p>
                      <span className="text-xs text-slate-400 mt-1 block">الإجابة: <strong className="text-teal-400">{q.answer}</strong></span>
                    </div>
                    <button
                      onClick={() => handleDeleteQuestion(q.id)}
                      className="p-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-xl transition-all border border-rose-500/20 cursor-pointer"
                      title="حذف السؤال"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* Tab 3: Students & Admins Management */}
        {activeTab === 'students' && (
          <div className="space-y-6">
            
            {/* Add User / Admin Form Bar */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl">
              <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-teal-400" /> إضافة مستخدم أو مشرف جديد للنظام
              </h3>
              <form onSubmit={(e) => {
                e.preventDefault();
                alert("تم إضافة المستخدم بنجاح وتحديث الصلاحيات!");
              }} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <input
                  type="text"
                  placeholder="الاسم الكامل"
                  required
                  className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-teal-500"
                />
                <input
                  type="email"
                  placeholder="البريد الإلكتروني"
                  required
                  className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-teal-500"
                />
                <select
                  className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-teal-500"
                >
                  <option value="STUDENT">مختبر / طالب (Student)</option>
                  <option value="ADMIN">مشرف نظام (Admin)</option>
                </select>
                <button
                  type="submit"
                  className="bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl text-xs py-2.5 transition-all shadow-md cursor-pointer"
                >
                  حفظ وإضافة الحساب
                </button>
              </form>
            </div>

            {/* Users & Admins Table List */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl">
              <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-teal-400" /> إدارة الحسابات والصلاحيات
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-right text-sm">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 text-xs">
                      <th className="pb-3 px-4">الاسم</th>
                      <th className="pb-3 px-4">البريد الإلكتروني</th>
                      <th className="pb-3 px-4">الدور والصلاحية</th>
                      <th className="pb-3 px-4">الإجراء</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300 text-xs">
                    <tr>
                      <td className="py-4 px-4 font-bold text-white">سارة محمد العتيبي</td>
                      <td className="py-4 px-4 text-slate-400">sara@example.com</td>
                      <td className="py-4 px-4"><span className="px-2.5 py-1 bg-teal-950 border border-teal-800 text-teal-400 font-bold rounded-lg">مختبر</span></td>
                      <td className="py-4 px-4">
                        <button onClick={() => alert("تم حذف المستخدم بنجاح")} className="text-rose-400 hover:underline font-semibold cursor-pointer">حذف الحساب</button>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-4 px-4 font-bold text-white">الأستاذ سعد القرني</td>
                      <td className="py-4 px-4 text-slate-400">admin@seen.edu.sa</td>
                      <td className="py-4 px-4"><span className="px-2.5 py-1 bg-amber-950 border border-amber-800 text-amber-400 font-bold rounded-lg">مشرف رئيسي (Admin)</span></td>
                      <td className="py-4 px-4">
                        <span className="text-slate-500 font-semibold">محمي</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

      </section>

      {/* Global Footer with Strict Attribution */}
      <footer className="w-full text-center py-6 border-t border-slate-900 text-xs text-slate-500 mt-auto flex flex-col items-center gap-1.5 px-6">
        <p>جميع الحقوق محفوظة © 2026 - منصة سين لتحديد مستوى اللغة الإنجليزية (CEFR)</p>
        <p className="text-teal-400 font-semibold bg-slate-900 px-4 py-1.5 rounded-full border border-slate-800 shadow-sm">
          تصميم وتطوير: الأستاذ سعد القرني
        </p>
      </footer>

    </main>
  );
}