'use client';

import React, { useState } from 'react';
import { Lock, Mail, User, Shield, ArrowLeft, Sparkles } from 'lucide-react';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // محاكاة عملية الدخول أو التسجيل والتحويل للرئيسية أو لوحة الاختبار
    alert(isLogin ? "تم تسجيل الدخول بنجاح!" : "تم إنشاء الحساب بنجاح!");
    window.location.href = '/';
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-teal-500 selection:text-white">
      
      {/* Top Header */}
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
        <a href="/" className="text-xs font-medium text-slate-400 hover:text-teal-400 transition-colors">
          العودة للرئيسية
        </a>
      </header>

      {/* Auth Card Form */}
      <section className="max-w-md w-full mx-auto px-6 py-12 my-auto">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          
          <div className="text-center mb-8">
            <h1 className="text-2xl font-black text-white">
              {isLogin ? "تسجيل الدخول إلى سين" : "إنشاء حساب جديد"}
            </h1>
            <p className="text-xs text-slate-400 mt-2">
              {isLogin ? "أدخل بيانات حسابك للمتابعة لاختباراتك وشهاداتك" : "سجل الآن وابدأ رحلة تقييم مستواك المعياري"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-xs text-slate-400 mb-1">الاسم الكامل</label>
                <div className="relative">
                  <span className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-500">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="الاسم الثلاثي"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pr-10 pl-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs text-slate-400 mb-1">البريد الإلكتروني</label>
              <div className="relative">
                <span className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pr-10 pl-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-teal-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">كلمة المرور</label>
              <div className="relative">
                <span className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pr-10 pl-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-teal-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-teal-900/40 flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              <span>{isLogin ? "تسجيل الدخول" : "إتمام التسجيل"}</span>
              <ArrowLeft className="w-4 h-4" />
            </button>
          </form>

          {/* Toggle between login & signup */}
          <div className="text-center mt-6 pt-6 border-t border-slate-800 text-xs">
            <span className="text-slate-400">
              {isLogin ? "ليس لديك حساب؟" : "لديك حساب بالفعل؟"}
            </span>{' '}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-teal-400 font-bold hover:underline cursor-pointer"
            >
              {isLogin ? "أنشئ حساباً جديداً" : "تسجيل الدخول"}
            </button>
          </div>

        </div>
      </section>

      {/* Global Footer */}
      <footer className="w-full text-center py-6 border-t border-slate-900 text-xs text-slate-500 mt-auto flex flex-col items-center gap-1.5 px-6">
        <p>جميع الحقوق محفوظة © 2026 - منصة سين لتحديد مستوى اللغة الإنجليزية (CEFR)</p>
        <p className="text-teal-400 font-semibold bg-slate-900 px-4 py-1.5 rounded-full border border-slate-800 shadow-sm">
          تصميم وتطوير: الأستاذ سعد القرني
        </p>
      </footer>

    </main>
  );
}