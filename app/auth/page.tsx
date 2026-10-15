'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Lock, Mail, Sparkles, User } from 'lucide-react';

export default function AuthPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const response = await fetch(isLogin ? '/api/auth/login' : '/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const result: unknown = await response.json();
      if (
        !result ||
        typeof result !== 'object' ||
        !('error' in result && typeof result.error === 'string') &&
          !('redirectTo' in result && typeof result.redirectTo === 'string')
      ) {
        throw new Error('تعذر قراءة استجابة تسجيل الدخول.');
      }
      if (!response.ok) {
        setError('error' in result && typeof result.error === 'string'
          ? result.error
          : 'تعذر إكمال الطلب.');
        return;
      }

      const defaultDestination =
        'redirectTo' in result && typeof result.redirectTo === 'string'
          ? result.redirectTo
          : '/';
      const nextDestination = new URLSearchParams(window.location.search).get('next');
      const isAdmin =
        'user' in result &&
        typeof result.user === 'object' &&
        result.user !== null &&
        'role' in result.user &&
        result.user.role === 'ADMIN';
      const destination =
        !isAdmin && nextDestination && /^\/test\/[A-Za-z0-9_-]+$/.test(nextDestination)
          ? nextDestination
          : defaultDestination;
      router.replace(destination);
      router.refresh();
    } catch (submitError) {
      console.error('Authentication request failed:', submitError);
      setError('تعذر الاتصال بالخدمة. تحقق من اتصالك ثم أعد المحاولة.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleMode = () => {
    setIsLogin((current) => !current);
    setError('');
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-teal-500 selection:text-white">
      <header className="max-w-7xl w-full mx-auto px-6 py-6 flex items-center justify-between border-b border-slate-900">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-teal-500/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-xl font-black tracking-tight text-white">Seen <span className="text-teal-400">Platform</span></span>
            <span className="block text-[10px] text-slate-400">منصة تقييم اللغة الإنجليزية (CEFR)</span>
          </div>
        </div>
        <Link href="/" className="text-xs font-medium text-slate-400 hover:text-teal-400 transition-colors">
          العودة للرئيسية
        </Link>
      </header>

      <section className="max-w-md w-full mx-auto px-6 py-12 my-auto">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-black text-white">
              {isLogin ? 'تسجيل الدخول إلى سين' : 'إنشاء حساب طالب'}
            </h1>
            <p className="text-xs text-slate-400 mt-2">
              {isLogin
                ? 'سجّل الدخول لمتابعة اختباراتك وشهاداتك'
                : 'أنشئ حسابًا للبدء في اختبارات تحديد المستوى'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label htmlFor="auth-name" className="block text-xs text-slate-400 mb-1">الاسم الكامل</label>
                <div className="relative">
                  <User className="absolute inset-y-0 right-0 mr-3.5 my-auto w-4 h-4 text-slate-500" />
                  <input
                    id="auth-name"
                    type="text"
                    required
                    minLength={2}
                    maxLength={120}
                    autoComplete="name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="الاسم الثلاثي"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pr-10 pl-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>
            )}

            <div>
              <label htmlFor="auth-email" className="block text-xs text-slate-400 mb-1">البريد الإلكتروني</label>
              <div className="relative">
                <Mail className="absolute inset-y-0 right-0 mr-3.5 my-auto w-4 h-4 text-slate-500" />
                <input
                  id="auth-email"
                  type="email"
                  required
                  maxLength={254}
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pr-10 pl-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-teal-500"
                />
              </div>
            </div>

            <div>
              <label htmlFor="auth-password" className="block text-xs text-slate-400 mb-1">كلمة المرور</label>
              <div className="relative">
                <Lock className="absolute inset-y-0 right-0 mr-3.5 my-auto w-4 h-4 text-slate-500" />
                <input
                  id="auth-password"
                  type="password"
                  required
                  minLength={isLogin ? undefined : 12}
                  maxLength={128}
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder={isLogin ? '••••••••' : '12 حرفًا على الأقل'}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pr-10 pl-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-teal-500"
                />
              </div>
              {!isLogin && <p className="mt-1 text-[10px] text-slate-500">كلمة المرور يجب أن تتكون من 12 حرفًا على الأقل.</p>}
            </div>

            {error && (
              <p role="alert" className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-xs text-rose-300">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 bg-teal-600 hover:bg-teal-500 disabled:opacity-60 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-teal-900/40 flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              <span>{isSubmitting ? 'جارٍ المعالجة...' : isLogin ? 'تسجيل الدخول' : 'إنشاء الحساب'}</span>
              {!isSubmitting && <ArrowLeft className="w-4 h-4" />}
            </button>
          </form>

          <div className="text-center mt-6 pt-6 border-t border-slate-800 text-xs">
            <span className="text-slate-400">
              {isLogin ? 'ليس لديك حساب؟' : 'لديك حساب بالفعل؟'}
            </span>{' '}
            <button
              type="button"
              onClick={toggleMode}
              disabled={isSubmitting}
              className="text-teal-400 font-bold hover:underline cursor-pointer disabled:opacity-50"
            >
              {isLogin ? 'أنشئ حساب طالب' : 'تسجيل الدخول'}
            </button>
          </div>
        </div>
      </section>

      <footer className="w-full text-center py-6 border-t border-slate-900 text-xs text-slate-500 mt-auto flex flex-col items-center gap-1.5 px-6">
        <p>جميع الحقوق محفوظة © 2026 - منصة سين لتحديد مستوى اللغة الإنجليزية (CEFR)</p>
        <p className="text-teal-400 font-semibold bg-slate-900 px-4 py-1.5 rounded-full border border-slate-800 shadow-sm">
          تصميم وتطوير: الأستاذ سعد القرني
        </p>
      </footer>
    </main>
  );
}
