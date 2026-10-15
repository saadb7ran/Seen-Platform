'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LayoutDashboard, Database, Users, PlusCircle, Sparkles, BookOpen, LogOut, Trash2 } from 'lucide-react';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'EXAMINER' | 'STUDENT';
  createdAt: string;
}

interface AdminQuestion {
  id: string;
  skill: string;
  level: string;
  prompt: string;
  answer: string;
  options: string[];
  passage: string | null;
}

interface AdminStats {
  testsToday: number;
  certificates: number;
  questions: number;
  averageScore: number | null;
}

function isAdminUser(value: unknown): value is AdminUser {
  if (!value || typeof value !== 'object') return false;
  const user = value as Record<string, unknown>;
  return (
    typeof user.id === 'string' &&
    typeof user.name === 'string' &&
    typeof user.email === 'string' &&
    (user.role === 'ADMIN' || user.role === 'EXAMINER' || user.role === 'STUDENT') &&
    typeof user.createdAt === 'string'
  );
}

function isAdminStats(value: unknown): value is AdminStats {
  if (!value || typeof value !== 'object') return false;
  const stats = value as Record<string, unknown>;
  return (
    typeof stats.testsToday === 'number' &&
    typeof stats.certificates === 'number' &&
    typeof stats.questions === 'number' &&
    (typeof stats.averageScore === 'number' || stats.averageScore === null)
  );
}

function parseAdminQuestion(value: unknown): AdminQuestion | null {
  if (!value || typeof value !== 'object') return null;
  const question = value as Record<string, unknown>;
  if (
    typeof question.id !== 'string' ||
    typeof question.skill !== 'string' ||
    typeof question.cefrLevel !== 'string' ||
    typeof question.prompt !== 'string' ||
    typeof question.correctAnswer !== 'string' ||
    !Array.isArray(question.options) ||
    !question.options.every((option) => typeof option === 'string') ||
    (typeof question.passageText !== 'string' && question.passageText !== null)
  ) {
    return null;
  }
  return {
    id: question.id,
    skill: question.skill,
    level: question.cefrLevel,
    prompt: question.prompt,
    answer: question.correctAnswer,
    options: question.options,
    passage: question.passageText,
  };
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'stats' | 'questions' | 'students'>('stats');
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [statsError, setStatsError] = useState('');
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [userError, setUserError] = useState('');
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState<'STUDENT' | 'EXAMINER'>('STUDENT');
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [resetUserId, setResetUserId] = useState('');
  const [resetPassword, setResetPassword] = useState('');
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  useEffect(() => {
    let active = true;
    const loadUsers = async () => {
      try {
        const response = await fetch('/api/admin/users');
        const data: unknown = await response.json();
        if (
          !response.ok ||
          !data ||
          typeof data !== 'object' ||
          !('users' in data) ||
          !Array.isArray(data.users) ||
          !data.users.every(isAdminUser)
        ) {
          throw new Error('تعذر تحميل قائمة المستخدمين.');
        }
        if (active) setUsers(data.users);
      } catch (error) {
        console.error('Could not load administrator user list:', error);
        if (active) setUserError(error instanceof Error ? error.message : 'تعذر تحميل قائمة المستخدمين.');
      } finally {
        if (active) setIsLoadingUsers(false);
      }
    };
    void loadUsers();
    return () => {
      active = false;
    };
  }, []);

  const handleAddUser = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setUserError('');
    setIsCreatingUser(true);
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newUserName,
          email: newUserEmail,
          password: newUserPassword,
          role: newUserRole,
        }),
      });
      const data: unknown = await response.json();
      if (!response.ok) {
        const message =
          data && typeof data === 'object' && 'error' in data && typeof data.error === 'string'
            ? data.error
            : 'تعذر إنشاء الحساب.';
        throw new Error(message);
      }
      if (!data || typeof data !== 'object' || !('user' in data) || !data.user) {
        throw new Error('استجابة إنشاء الحساب غير صالحة.');
      }
      setUsers((current) => [data.user as AdminUser, ...current].slice(0, 100));
      setNewUserName('');
      setNewUserEmail('');
      setNewUserPassword('');
    } catch (error) {
      console.error('Could not create administrator-managed account:', error);
      setUserError(error instanceof Error ? error.message : 'تعذر إنشاء الحساب.');
    } finally {
      setIsCreatingUser(false);
    }
  };

  const handleResetPassword = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!resetUserId) return;
    setUserError('');
    setIsResettingPassword(true);
    try {
      const response = await fetch(
        `/api/admin/users/${encodeURIComponent(resetUserId)}/password`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password: resetPassword }),
        },
      );
      const data: unknown = await response.json();
      if (!response.ok) {
        const message =
          data && typeof data === 'object' && 'error' in data && typeof data.error === 'string'
            ? data.error
            : 'تعذر إعادة تعيين كلمة المرور.';
        throw new Error(message);
      }
      setResetPassword('');
      setResetUserId('');
      setUserError('');
      alert('تم تحديث كلمة المرور. سلّمها لصاحب الحساب عبر قناة آمنة.');
    } catch (error) {
      console.error('Could not reset account password:', error);
      setUserError(error instanceof Error ? error.message : 'تعذر إعادة تعيين كلمة المرور.');
    } finally {
      setIsResettingPassword(false);
    }
  };

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      const response = await fetch('/api/auth/logout', { method: 'POST' });
      if (!response.ok) throw new Error(`Logout failed with status ${response.status}`);
      router.replace('/auth');
      router.refresh();
    } catch (error) {
      console.error('Could not sign out:', error);
      alert('تعذر تسجيل الخروج. أعد المحاولة.');
    } finally {
      setIsSigningOut(false);
    }
  };

  const [questions, setQuestions] = useState<AdminQuestion[]>([]);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(true);
  const [isSavingQuestion, setIsSavingQuestion] = useState(false);
  const [questionError, setQuestionError] = useState('');
  const [questionNotice, setQuestionNotice] = useState('');

  const [newPrompt, setNewPrompt] = useState('');
  const [newSkill, setNewSkill] = useState('READING');
  const [newLevel, setNewLevel] = useState('B2');
  const [newAnswer, setNewAnswer] = useState('');
  const [newOptions, setNewOptions] = useState('');
  const [newPassage, setNewPassage] = useState('');

  // حالات وإضافات الذكاء الاصطناعي
  const [isAIGenerating, setIsAIGenerating] = useState(false);

  useEffect(() => {
    let active = true;
    const loadStats = async () => {
      try {
        const response = await fetch('/api/admin/stats');
        const data: unknown = await response.json();
        if (!response.ok || !isAdminStats(data)) {
          throw new Error('تعذر تحميل الإحصاءات.');
        }
        if (active) setStats(data);
      } catch (error) {
        console.error('Could not load administrator statistics:', error);
        if (active) setStatsError('تعذر تحميل الإحصاءات من قاعدة البيانات.');
      }
    };
    void loadStats();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    const loadQuestions = async () => {
      try {
        const response = await fetch('/api/admin/questions');
        const data: unknown = await response.json();
        const parsed =
          data && typeof data === 'object' && 'questions' in data && Array.isArray(data.questions)
            ? data.questions.map(parseAdminQuestion)
            : null;
        if (!response.ok || !parsed || parsed.some((question) => question === null)) {
          throw new Error('تعذر تحميل بنك الأسئلة.');
        }
        if (active) setQuestions(parsed.filter((question): question is AdminQuestion => question !== null));
      } catch (error) {
        console.error('Could not load the question bank:', error);
        if (active) setQuestionError(error instanceof Error ? error.message : 'تعذر تحميل بنك الأسئلة.');
      } finally {
        if (active) setIsLoadingQuestions(false);
      }
    };
    void loadQuestions();
    return () => {
      active = false;
    };
  }, []);

  const handleAIGenerate = async () => {
    setIsAIGenerating(true);
    setQuestionError('');
    setQuestionNotice('');
    try {
      const res = await fetch('/api/ai/generate-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skill: newSkill, level: newLevel })
      });
      
      const data: unknown = await res.json();
      if (
        !res.ok ||
        !data ||
        typeof data !== 'object' ||
        !('question' in data) ||
        !data.question ||
        typeof data.question !== 'object' ||
        !('prompt' in data.question) ||
        typeof data.question.prompt !== 'string' ||
        !('correctAnswer' in data.question) ||
        typeof data.question.correctAnswer !== 'string' ||
        !('options' in data.question) ||
        !Array.isArray(data.question.options) ||
        !data.question.options.every((option: unknown) => typeof option === 'string') ||
        !('passage' in data.question) ||
        (typeof data.question.passage !== 'string' && data.question.passage !== null)
      ) {
        const message =
          data && typeof data === 'object' && 'error' in data && typeof data.error === 'string'
            ? data.error
            : 'فشل توليد السؤال.';
        throw new Error(message);
      }
      setNewPrompt(data.question.prompt);
      setNewAnswer(data.question.correctAnswer);
      setNewOptions(data.question.options.join('\n'));
      setNewPassage(typeof data.question.passage === 'string' ? data.question.passage : '');
      setQuestionNotice('تم توليد السؤال. راجعه ثم احفظه في بنك الأسئلة.');
    } catch (error) {
      console.error('Could not generate a question:', error);
      setQuestionError(error instanceof Error ? error.message : 'حدث خطأ أثناء الاتصال بخدمة الذكاء الاصطناعي.');
    } finally {
      setIsAIGenerating(false);
    }
  };

  const handleAddQuestion = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setQuestionError('');
    setQuestionNotice('');
    const options = newOptions.split('\n').map((option) => option.trim()).filter(Boolean);
    const correctAnswer = newAnswer.trim();
    if (options.length < 2 || !options.includes(correctAnswer)) {
      setQuestionError('أدخل خيارين على الأقل، واجعل الإجابة الصحيحة مطابقة لأحد الخيارات.');
      return;
    }

    setIsSavingQuestion(true);
    try {
      const response = await fetch('/api/admin/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          skill: newSkill,
          level: newLevel,
          prompt: newPrompt,
          answer: correctAnswer,
          options,
          passage: newSkill === 'READING' ? newPassage : null,
        }),
      });
      const data: unknown = await response.json();
      const question =
        data && typeof data === 'object' && 'question' in data
          ? parseAdminQuestion(data.question)
          : null;
      if (!response.ok || !question) {
        const message =
          data && typeof data === 'object' && 'error' in data && typeof data.error === 'string'
            ? data.error
            : 'تعذر حفظ السؤال.';
        throw new Error(message);
      }
      setQuestions((current) => [question, ...current]);
      setNewPrompt('');
      setNewAnswer('');
      setNewOptions('');
      setNewPassage('');
      setQuestionNotice('تم حفظ السؤال في بنك الأسئلة.');
    } catch (error) {
      console.error('Could not save question:', error);
      setQuestionError(error instanceof Error ? error.message : 'تعذر حفظ السؤال.');
    } finally {
      setIsSavingQuestion(false);
    }
  };

  const handleDeleteQuestion = async (id: string) => {
    if (!window.confirm('سيُحذف السؤال من بنك الأسئلة والاختبارات المرتبطة به. لا يمكن حذفه أثناء وجود اختبار جارٍ يستخدمه. هل تريد المتابعة؟')) {
      return;
    }
    setQuestionError('');
    try {
      const response = await fetch(`/api/admin/questions/${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      const data: unknown = response.status === 204 ? null : await response.json();
      if (!response.ok) {
        const message =
          data && typeof data === 'object' && 'error' in data && typeof data.error === 'string'
            ? data.error
            : 'تعذر حذف السؤال.';
        throw new Error(message);
      }
      setQuestions((current) => current.filter((question) => question.id !== id));
    } catch (error) {
      console.error('Could not delete question:', error);
      setQuestionError(error instanceof Error ? error.message : 'تعذر حذف السؤال.');
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-teal-500 selection:text-white">
      
      {/* Top Header */}
      <header className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-5 flex flex-wrap items-center justify-between gap-4 border-b border-slate-900 bg-slate-900/50 backdrop-blur-md rounded-b-3xl">
        <div className="flex min-w-0 items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-teal-500/20">
            <LayoutDashboard className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-white">لوحة تحكم الإدارة <span className="text-teal-400">Seen Admin</span></h1>
            <span className="block text-[10px] text-slate-400">إدارة بنك الأسئلة، الاختبارات، والمختبرين</span>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={handleSignOut}
            disabled={isSigningOut}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs font-semibold text-slate-300 transition-all disabled:opacity-50"
          >
            <span className="inline-flex items-center gap-2">
              <LogOut className="w-4 h-4" />
              {isSigningOut ? 'جارٍ الخروج...' : 'تسجيل الخروج'}
            </span>
          </button>
          <Link
            href="/"
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs font-semibold text-slate-300 transition-all"
          >
            العودة للمنصة
          </Link>
        </div>
      </header>

      {/* Main Admin Body */}
      <section className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 my-auto">
        
        {/* Navigation Tabs */}
        <nav aria-label="أقسام لوحة الإدارة" className="flex max-w-full items-center gap-2 mb-8 bg-slate-900 p-1.5 rounded-2xl border border-slate-800 w-fit overflow-x-auto">
          <button
            onClick={() => setActiveTab('stats')}
            className={`shrink-0 px-3 sm:px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'stats' ? 'bg-teal-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>نظرة عامة</span>
          </button>
          <button
            onClick={() => setActiveTab('questions')}
            className={`shrink-0 px-3 sm:px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'questions' ? 'bg-teal-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>إدارة بنك الأسئلة</span>
          </button>
          <button
            onClick={() => setActiveTab('students')}
            className={`shrink-0 px-3 sm:px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'students' ? 'bg-teal-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>المستخدمين والصلاحيات</span>
          </button>
        </nav>

        {/* Tab 1: Stats Overview */}
        {activeTab === 'stats' && (
          <div className="space-y-6">
            {statsError && <p role="alert" className="text-xs text-rose-300">{statsError}</p>}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl">
                <span className="text-xs text-slate-400 block mb-1">إجمالي اختبارات اليوم</span>
                <span className="text-3xl font-black text-white">{stats?.testsToday ?? '—'}</span>
                <span className="text-[10px] text-slate-500 mt-2 block">جلسات بدأت خلال اليوم</span>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl">
                <span className="text-xs text-slate-400 block mb-1">الشهادات الصادرة</span>
                <span className="text-3xl font-black text-teal-400">{stats?.certificates ?? '—'}</span>
                <span className="text-[10px] text-slate-500 mt-2 block">موثقة برمز تحقق فريد</span>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl">
                <span className="text-xs text-slate-400 block mb-1">أسئلة بنك المعرفة</span>
                <span className="text-3xl font-black text-white">{stats?.questions ?? '—'}</span>
                <span className="text-[10px] text-teal-400 mt-2 block">موزعة على مستويات CEFR</span>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl">
                <span className="text-xs text-slate-400 block mb-1">متوسط النجاح العام</span>
                <span className="text-3xl font-black text-emerald-400">
                  {stats?.averageScore === null || stats?.averageScore === undefined
                    ? '—'
                    : `${stats.averageScore}%`}
                </span>
                <span className="text-[10px] text-slate-500 mt-2 block">متوسط نتائج الاختبارات المكتملة</span>
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

              {questionError && <p role="alert" className="mb-4 text-xs text-rose-300">{questionError}</p>}
              {questionNotice && <p role="status" className="mb-4 text-xs text-holst-sage">{questionNotice}</p>}
              <form onSubmit={handleAddQuestion} className="space-y-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">المهارة اللغوية</label>
                  <select
                    value={newSkill}
                    onChange={(e) => {
                      setNewSkill(e.target.value);
                      if (e.target.value !== 'READING') setNewPassage('');
                    }}
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
                    required
                    maxLength={4000}
                    value={newPrompt}
                    onChange={(e) => setNewPrompt(e.target.value)}
                    placeholder="اكتب السؤال هنا..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-teal-500 resize-none"
                  />
                </div>

                {newSkill === 'READING' && (
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">نص القراءة المرتبط بالسؤال</label>
                    <textarea
                      rows={5}
                      required
                      maxLength={6000}
                      value={newPassage}
                      onChange={(e) => setNewPassage(e.target.value)}
                      placeholder="اكتب نص القراءة أو ولّده بالذكاء الاصطناعي..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-teal-500 resize-y"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs text-slate-400 mb-1">الخيارات (كل خيار في سطر)</label>
                  <textarea
                    rows={4}
                    required
                    value={newOptions}
                    onChange={(e) => setNewOptions(e.target.value)}
                    placeholder={'الخيار الأول\nالخيار الثاني'}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-teal-500 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">الإجابة الصحيحة</label>
                  <input
                    type="text"
                    required
                    maxLength={1000}
                    value={newAnswer}
                    onChange={(e) => setNewAnswer(e.target.value)}
                    placeholder="الإجابة الصحيحة للتصحيح الآلي"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-teal-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSavingQuestion}
                  className="w-full py-3 bg-teal-600 hover:bg-teal-500 disabled:opacity-60 text-white font-bold rounded-xl text-xs transition-all shadow-md cursor-pointer"
                >
                  {isSavingQuestion ? 'جارٍ حفظ السؤال...' : 'حفظ وإضافة السؤال للبنك'}
                </button>
              </form>
            </div>

            {/* Questions Table List */}
            <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-6 rounded-3xl">
              <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-teal-400" /> الأسئلة المسجلة في البنك الحالي
              </h3>
              {isLoadingQuestions ? (
                <p className="text-sm text-slate-400">جارٍ تحميل بنك الأسئلة...</p>
              ) : questions.length === 0 ? (
                <p className="text-sm text-slate-400">لا توجد أسئلة مسجلة حاليًا.</p>
              ) : null}
              
              <div className="space-y-3">
                {questions.map((q) => (
                  <div key={q.id} className="bg-slate-950/80 border border-slate-800 p-4 rounded-2xl flex items-center justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2.5 py-0.5 bg-teal-500/10 text-teal-400 font-bold text-[10px] rounded-lg border border-teal-500/20">{q.skill}</span>
                        <span className="px-2.5 py-0.5 bg-slate-800 text-slate-300 font-bold text-[10px] rounded-lg">{q.level}</span>
                      </div>
                      <p className="text-sm text-slate-200 font-medium">{q.prompt}</p>
                      {q.passage && (
                        <p className="text-xs text-slate-400 mt-2 whitespace-pre-wrap">
                          نص القراءة: {q.passage}
                        </p>
                      )}
                      <span className="text-xs text-slate-400 mt-1 block">الإجابة: <strong className="text-teal-400">{q.answer}</strong></span>
                      {q.options.length > 0 && (
                        <span className="text-[10px] text-slate-500 mt-1 block">
                          {q.options.join(' · ')}
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
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
              <form onSubmit={handleAddUser} className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <input
                  type="text"
                  value={newUserName}
                  onChange={(event) => setNewUserName(event.target.value)}
                  placeholder="الاسم الكامل"
                  required
                  minLength={2}
                  maxLength={120}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-teal-500"
                />
                <input
                  type="email"
                  value={newUserEmail}
                  onChange={(event) => setNewUserEmail(event.target.value)}
                  placeholder="البريد الإلكتروني"
                  required
                  className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-teal-500"
                />
                <input
                  type="password"
                  value={newUserPassword}
                  onChange={(event) => setNewUserPassword(event.target.value)}
                  placeholder="كلمة مرور مؤقتة (12+)"
                  required
                  minLength={12}
                  maxLength={128}
                  autoComplete="new-password"
                  className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-teal-500"
                />
                <select
                  value={newUserRole}
                  onChange={(event) => setNewUserRole(event.target.value === 'EXAMINER' ? 'EXAMINER' : 'STUDENT')}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-teal-500"
                >
                  <option value="STUDENT">مختبر / طالب (Student)</option>
                  <option value="EXAMINER">ممتحن (Examiner)</option>
                </select>
                <button
                  type="submit"
                  disabled={isCreatingUser}
                  className="bg-teal-600 hover:bg-teal-500 disabled:opacity-60 text-white font-bold rounded-xl text-xs py-2.5 transition-all shadow-md cursor-pointer"
                >
                  {isCreatingUser ? 'جارٍ الإنشاء...' : 'إنشاء الحساب'}
                </button>
              </form>
              <p className="mt-3 text-[10px] text-slate-500">
                تُنشأ حسابات الطلاب والممتحنين من هنا. إنشاء حساب مدير متاح بأمر الإعداد فقط.
              </p>
              {userError && <p role="alert" className="mt-3 text-xs text-rose-300">{userError}</p>}
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
                    {isLoadingUsers ? (
                      <tr><td colSpan={4} className="py-5 px-4 text-center text-slate-400">جارٍ تحميل الحسابات...</td></tr>
                    ) : users.length ? users.map((user) => (
                      <tr key={user.id}>
                        <td className="py-4 px-4 font-bold text-white">{user.name}</td>
                        <td className="py-4 px-4 text-slate-400">{user.email}</td>
                        <td className="py-4 px-4">
                          <span className="px-2.5 py-1 bg-slate-800 border border-slate-700 text-slate-200 font-bold rounded-lg">
                            {user.role === 'ADMIN' ? 'مدير' : user.role === 'EXAMINER' ? 'ممتحن' : 'طالب'}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <button
                            type="button"
                            onClick={() => {
                              setResetUserId(user.id);
                              setResetPassword('');
                            }}
                            className="text-teal-400 hover:underline font-semibold"
                          >
                            إعادة تعيين كلمة المرور
                          </button>
                        </td>
                      </tr>
                    )) : (
                      <tr><td colSpan={4} className="py-5 px-4 text-center text-slate-400">لا توجد حسابات مسجلة.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
              {resetUserId && (
                <form onSubmit={handleResetPassword} className="mt-5 flex flex-col sm:flex-row gap-3">
                  <p className="self-center text-xs text-slate-300">
                    تعيين كلمة مرور جديدة لـ {users.find((user) => user.id === resetUserId)?.email}
                  </p>
                  <input
                    type="password"
                    required
                    minLength={12}
                    maxLength={128}
                    autoComplete="new-password"
                    value={resetPassword}
                    onChange={(event) => setResetPassword(event.target.value)}
                    placeholder="كلمة مرور جديدة (12+)"
                    className="min-w-0 flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-teal-500"
                  />
                  <button
                    type="submit"
                    disabled={isResettingPassword}
                    className="px-4 py-2.5 bg-teal-600 hover:bg-teal-500 disabled:opacity-60 text-white font-bold rounded-xl text-xs"
                  >
                    {isResettingPassword ? 'جارٍ التحديث...' : 'تحديث كلمة المرور'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setResetUserId('')}
                    className="px-4 py-2.5 border border-slate-700 rounded-xl text-slate-300 text-xs"
                  >
                    إلغاء
                  </button>
                </form>
              )}
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