"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

export default function StaffAccountsPage() {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  async function createTeacher(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");
    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form));
    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await response.json() as { user?: { username: string }; error?: string };
      if (!response.ok) throw new Error(data.error ?? "تعذر إنشاء الحساب.");
      setMessage(`تم إنشاء حساب المعلمة ${data.user?.username}.`);
      form.reset();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "تعذر إنشاء الحساب.");
    }
  }
  return (
    <main dir="rtl" className="min-h-screen bg-slate-50 p-5 sm:p-8">
      <div className="mx-auto max-w-xl space-y-6">
        <Link href="/admin/dashboard" className="text-sm font-bold text-emerald-800">العودة للوحة الإدارة</Link>
        <form onSubmit={createTeacher} className="rounded-2xl border bg-white p-6 space-y-4">
          <h1 className="text-2xl font-black">إنشاء حساب معلمة</h1>
          <p className="text-sm text-slate-500">حسابات الطالبات تُنشأ بالتسجيل الذاتي. هذه الصفحة لمدير المنصة فقط.</p>
          <label className="block text-sm font-bold">الاسم الكامل<input name="fullName" required maxLength={255} className="mt-1 w-full rounded-xl border p-3 font-normal" /></label>
          <label className="block text-sm font-bold">اسم المستخدم<input name="username" required minLength={3} maxLength={100} className="mt-1 w-full rounded-xl border p-3 font-normal" /></label>
          <label className="block text-sm font-bold">كلمة المرور المؤقتة<input name="password" type="password" required minLength={12} maxLength={128} className="mt-1 w-full rounded-xl border p-3 font-normal" /></label>
          {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
          {message && <p role="status" className="text-sm text-emerald-800">{message}</p>}
          <button className="rounded-xl bg-emerald-800 px-5 py-3 font-bold text-white">إنشاء حساب المعلمة</button>
        </form>
      </div>
    </main>
  );
}
