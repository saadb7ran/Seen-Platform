"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { readJsonResponse } from "@/lib/client-http";

export default function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const isRegister = mode === "register";

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setBusy(true);
    const form = new FormData(event.currentTarget);
    const payload = Object.fromEntries(form);
    const requestPayload = {
      ...payload,
      ...(payload.gradeLevel ? { gradeLevel: Number(payload.gradeLevel) } : {}),
    };
    if (!payload.gradeLevel) delete requestPayload.gradeLevel;
    const endpoint = isRegister ? "/api/auth/register" : "/api/auth/login";
    try {
      const response = await fetch(endpoint, { method: "POST", body: JSON.stringify(requestPayload), headers: { "Content-Type": "application/json" } });
      const data = await readJsonResponse<{ user?: { role: string } }>(response, "تعذر تسجيل الدخول.");
      const next = new URLSearchParams(window.location.search).get("next");
      router.replace(next?.startsWith("/") && !next.startsWith("//") ? next : data.user?.role === "STUDENT" ? "/account" : "/admin/dashboard");
      router.refresh();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "حدث خطأ غير متوقع.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main dir="rtl" className="min-h-screen bg-slate-50 flex items-center justify-center p-5">
      <form onSubmit={submit} className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-8 shadow-sm space-y-5">
        <Link href="/" className="text-sm text-emerald-800 font-bold">منصة سين</Link>
        <div>
          <h1 className="text-2xl font-black text-slate-900">{isRegister ? "إنشاء حساب طالبة" : "تسجيل الدخول"}</h1>
          <p className="text-sm text-slate-500 mt-2">{isRegister ? "أنشئي حسابًا للبدء في الاختبارات المتاحة." : "أدخلي بيانات الحساب للمتابعة."}</p>
        </div>
        {isRegister && <label className="block text-sm font-bold">الاسم الكامل<input name="fullName" required maxLength={255} autoComplete="name" className="mt-1 w-full rounded-xl border p-3 font-normal" /></label>}
        <label className="block text-sm font-bold">اسم المستخدم<input name="username" required minLength={3} maxLength={100} autoComplete="username" className="mt-1 w-full rounded-xl border p-3 font-normal" /></label>
        {isRegister && <label className="block text-sm font-bold">الصف الدراسي (اختياري)<input name="gradeLevel" type="number" min={1} max={12} className="mt-1 w-full rounded-xl border p-3 font-normal" /></label>}
        <label className="block text-sm font-bold">كلمة المرور<input name="password" type="password" required minLength={isRegister ? 12 : 1} maxLength={128} autoComplete={isRegister ? "new-password" : "current-password"} className="mt-1 w-full rounded-xl border p-3 font-normal" /></label>
        {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
        <button disabled={busy} className="w-full rounded-xl bg-emerald-800 text-white p-3 font-bold disabled:opacity-50">{busy ? "جارٍ التنفيذ..." : isRegister ? "إنشاء الحساب" : "دخول"}</button>
        <p className="text-sm text-slate-600">
          {isRegister ? "لديك حساب؟ " : "ليس لديك حساب؟ "}
          <Link className="font-bold text-emerald-800" href={isRegister ? "/login" : "/register"}>{isRegister ? "تسجيل الدخول" : "إنشاء حساب طالبة"}</Link>
        </p>
      </form>
    </main>
  );
}
