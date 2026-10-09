"use client";

import { CefrLevel, QuestionType, SkillType, TestStatus } from "@prisma/client";
import { FormEvent, useEffect, useState } from "react";
import QRCode from "qrcode";
import Link from "next/link";
import Image from "next/image";

type Question = {
  id: string;
  skill: SkillType;
  questionType: QuestionType;
  contentText: string;
  difficultyLevel: CefrLevel;
  points: string | number;
  optionsJson: unknown;
  correctAnswer: string | null;
};
type Test = {
  id: string;
  title: string;
  accessCode: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  status: TestStatus;
  _count: { sessions: number };
};

const labels: Record<SkillType, string> = {
  LISTENING: "الاستماع",
  SPEAKING: "التحدث",
  READING: "القراءة",
  WRITING: "الكتابة",
};

async function requestJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  const result = await response.json() as T & { error?: string };
  if (!response.ok) throw new Error(result.error ?? "تعذر تنفيذ العملية.");
  return result;
}

function ExamQr({ code }: { code: string }) {
  const [image, setImage] = useState("");
  useEffect(() => {
    QRCode.toDataURL(`${window.location.origin}/exam/${code}`, { width: 180, margin: 1 })
      .then(setImage)
      .catch((error: unknown) => console.error("QR generation failed", error));
  }, [code]);
  return image ? <Image src={image} alt={`رمز QR للاختبار ${code}`} width={112} height={112} unoptimized className="w-28 h-28" /> : null;
}

export default function QuestionBankPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [tests, setTests] = useState<Test[]>([]);
  const [query, setQuery] = useState("");
  const [skill, setSkill] = useState<SkillType | "ALL">("ALL");
  const [questionError, setQuestionError] = useState("");
  const [testError, setTestError] = useState("");
  const [busy, setBusy] = useState(false);
  const [questionType, setQuestionType] = useState<QuestionType>(QuestionType.MCQ);
  const [optionsText, setOptionsText] = useState("");
  const [correctAnswer, setCorrectAnswer] = useState("");

  async function load() {
    const [questionResult, testResult] = await Promise.all([
      requestJson<{ questions: Question[] }>("/api/admin/questions"),
      requestJson<{ tests: Test[] }>("/api/admin/tests"),
    ]);
    setQuestions(questionResult.questions);
    setTests(testResult.tests);
  }

  useEffect(() => {
    queueMicrotask(() => {
      load().catch((error: unknown) => setQuestionError(error instanceof Error ? error.message : "تعذر تحميل البيانات."));
    });
  }, []);

  async function createQuestion(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setBusy(true);
    setQuestionError("");
    const values = new FormData(form);
    const optionsJson = optionsText.split("\n").map((item) => item.trim()).filter(Boolean);
    try {
      await requestJson("/api/admin/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          skill: values.get("skill"),
          questionType,
          difficultyLevel: values.get("difficultyLevel"),
          points: Number(values.get("points")),
          contentText: values.get("contentText"),
          mediaUrl: values.get("mediaUrl") || undefined,
          optionsJson: questionType === QuestionType.MCQ ? optionsJson : undefined,
          correctAnswer: questionType === QuestionType.MCQ ? correctAnswer : undefined,
        }),
      });
      form.reset();
      setOptionsText("");
      setCorrectAnswer("");
      await load();
    } catch (error) {
      setQuestionError(error instanceof Error ? error.message : "تعذر حفظ السؤال.");
    } finally {
      setBusy(false);
    }
  }

  async function createTest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setTestError("");
    const values = new FormData(event.currentTarget);
    const questionIds = values.getAll("questionIds").map(String);
    try {
      await requestJson("/api/admin/tests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: values.get("title"),
          startTime: new Date(String(values.get("startTime"))).toISOString(),
          endTime: new Date(String(values.get("endTime"))).toISOString(),
          durationMinutes: Number(values.get("durationMinutes")),
          questionIds,
          status: values.get("status") === "ACTIVE" ? "ACTIVE" : "DRAFT",
          isRandomized: values.get("isRandomized") === "on",
        }),
      });
      event.currentTarget.reset();
      await load();
    } catch (error) {
      setTestError(error instanceof Error ? error.message : "تعذر إنشاء الاختبار.");
    } finally {
      setBusy(false);
    }
  }

  async function changeStatus(test: Test) {
    const status = test.status === TestStatus.DRAFT ? TestStatus.ACTIVE : TestStatus.COMPLETED;
    try {
      await requestJson(`/api/admin/tests/${test.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      await load();
    } catch (error) {
      setTestError(error instanceof Error ? error.message : "تعذر تغيير الحالة.");
    }
  }

  async function editQuestion(question: Question) {
    const contentText = window.prompt("عدّل نص السؤال:", question.contentText);
    if (contentText === null || contentText.trim() === question.contentText) return;
    try {
      await requestJson(`/api/admin/questions/${question.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contentText }),
      });
      await load();
    } catch (error) {
      setQuestionError(error instanceof Error ? error.message : "تعذر تعديل السؤال.");
    }
  }

  async function deleteTest(test: Test) {
    if (!window.confirm(`هل تريد حذف الاختبار «${test.title}»؟`)) return;
    try {
      await requestJson(`/api/admin/tests/${test.id}`, { method: "DELETE" });
      await load();
    } catch (error) {
      setTestError(error instanceof Error ? error.message : "تعذر حذف الاختبار.");
    }
  }

  async function deleteQuestion(questionId: string) {
    if (!window.confirm("هل تريد حذف هذا السؤال؟")) return;
    try {
      await requestJson(`/api/admin/questions/${questionId}`, { method: "DELETE" });
      await load();
    } catch (error) {
      setQuestionError(error instanceof Error ? error.message : "تعذر حذف السؤال.");
    }
  }

  const visibleQuestions = questions.filter((question) =>
    (skill === "ALL" || question.skill === skill) &&
    question.contentText.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase())
  );

  return (
    <main dir="rtl" className="min-h-screen bg-slate-50 text-slate-800 p-5 sm:p-8 space-y-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black">إدارة الاختبارات وبنك الأسئلة</h1>
          <p className="mt-1 text-sm text-slate-500">إنشاء أسئلة وجدولة اختبارات ومشاركة رمز الدخول مع الطالبات.</p>
        </div>
        <nav className="flex gap-4 text-sm font-bold">
          <Link href="/admin/dashboard">لوحة المتابعة</Link>
          <Link href="/admin/studio">التصحيح</Link>
        </nav>
      </header>

      <section className="grid gap-6 lg:grid-cols-2">
        <form onSubmit={createQuestion} className="rounded-2xl border bg-white p-5 space-y-4">
          <h2 className="text-lg font-extrabold">إضافة سؤال إلى البنك</h2>
          <label className="block text-sm font-bold">نص السؤال<textarea name="contentText" required maxLength={10000} rows={3} className="mt-1 w-full rounded-xl border p-3 font-normal" /></label>
          <label className="block text-sm font-bold">رابط ملف صوت/وسائط (اختياري)<input name="mediaUrl" type="url" className="mt-1 w-full rounded-xl border p-2 font-normal" /></label>
          <div className="grid grid-cols-2 gap-3">
            <label className="text-sm font-bold">المهارة<select name="skill" className="mt-1 w-full rounded-xl border p-2">{Object.values(SkillType).map((value) => <option key={value} value={value}>{labels[value]}</option>)}</select></label>
            <label className="text-sm font-bold">نوع السؤال<select value={questionType} onChange={(event) => setQuestionType(event.target.value as QuestionType)} className="mt-1 w-full rounded-xl border p-2">{Object.values(QuestionType).map((value) => <option key={value}>{value}</option>)}</select></label>
            <label className="text-sm font-bold">المستوى<select name="difficultyLevel" className="mt-1 w-full rounded-xl border p-2">{Object.values(CefrLevel).map((value) => <option key={value}>{value}</option>)}</select></label>
            <label className="text-sm font-bold">الدرجة<input name="points" type="number" min="0.1" max="100" step="0.1" defaultValue="1" required className="mt-1 w-full rounded-xl border p-2" /></label>
          </div>
          {questionType === QuestionType.MCQ && <>
            <label className="block text-sm font-bold">الخيارات (خيار في كل سطر)<textarea value={optionsText} onChange={(event) => setOptionsText(event.target.value)} required rows={3} className="mt-1 w-full rounded-xl border p-3 font-normal" /></label>
            <label className="block text-sm font-bold">نص الإجابة الصحيحة<input value={correctAnswer} onChange={(event) => setCorrectAnswer(event.target.value)} required className="mt-1 w-full rounded-xl border p-2 font-normal" /></label>
          </>}
          {questionError && <p role="alert" className="text-sm text-red-700">{questionError}</p>}
          <button disabled={busy} className="rounded-xl bg-emerald-800 px-4 py-2 text-white font-bold disabled:opacity-50">حفظ السؤال</button>
        </form>

        <form onSubmit={createTest} className="rounded-2xl border bg-white p-5 space-y-4">
          <h2 className="text-lg font-extrabold">إنشاء اختبار وجدولته</h2>
          <label className="block text-sm font-bold">عنوان الاختبار<input name="title" maxLength={255} required className="mt-1 w-full rounded-xl border p-2 font-normal" /></label>
          <div className="grid grid-cols-2 gap-3">
            <label className="text-sm font-bold">يبدأ<input name="startTime" type="datetime-local" required className="mt-1 w-full rounded-xl border p-2" /></label>
            <label className="text-sm font-bold">ينتهي<input name="endTime" type="datetime-local" required className="mt-1 w-full rounded-xl border p-2" /></label>
          </div>
          <label className="block text-sm font-bold">مدة الاختبار (دقيقة)<input name="durationMinutes" type="number" min={1} max={480} defaultValue={45} required className="mt-1 w-full rounded-xl border p-2" /></label>
          <fieldset className="space-y-2">
            <legend className="text-sm font-bold">اختر الأسئلة</legend>
            <div className="max-h-40 overflow-auto space-y-2 rounded-xl border p-3">
              {questions.map((question) => <label key={question.id} className="flex gap-2 text-sm"><input type="checkbox" name="questionIds" value={question.id} /><span>{labels[question.skill]} · {question.contentText}</span></label>)}
              {!questions.length && <p className="text-sm text-slate-500">أضف أسئلة قبل إنشاء الاختبار.</p>}
            </div>
          </fieldset>
          <label className="flex items-center gap-2 text-sm"><input name="isRandomized" type="checkbox" defaultChecked /> ترتيب عشوائي للأسئلة</label>
          <label className="flex items-center gap-2 text-sm"><input name="status" type="checkbox" value="ACTIVE" /> تفعيل الاختبار فورًا ضمن الفترة المحددة</label>
          {testError && <p role="alert" className="text-sm text-red-700">{testError}</p>}
          <button disabled={busy || !questions.length} className="rounded-xl bg-emerald-800 px-4 py-2 text-white font-bold disabled:opacity-50">إنشاء الاختبار</button>
        </form>
      </section>

      <section className="rounded-2xl border bg-white p-5 space-y-4">
        <h2 className="text-lg font-extrabold">الاختبارات المنشأة</h2>
        {!tests.length && <p className="text-sm text-slate-500">لا توجد اختبارات حتى الآن.</p>}
        <div className="grid gap-4 md:grid-cols-2">
          {tests.map((test) => <article key={test.id} className="rounded-xl border p-4 flex items-start justify-between gap-4">
            <div>
              <h3 className="font-bold">{test.title}</h3>
              <p className="mt-1 text-sm text-slate-600">الحالة: {test.status} · الجلسات: {test._count.sessions}</p>
              <p className="mt-1 font-mono font-bold text-emerald-800">{test.accessCode}</p>
              <Link href={`/exam/${test.accessCode}`} className="text-sm text-blue-700 underline">فتح صفحة الاختبار</Link>
              <div className="mt-3"><ExamQr code={test.accessCode} /></div>
            </div>
            <div className="flex shrink-0 flex-col gap-2">
              {test.status !== TestStatus.COMPLETED && <button onClick={() => changeStatus(test)} className="rounded-lg border px-3 py-2 text-sm font-bold">{test.status === TestStatus.ACTIVE ? "إيقاف الاختبار" : "تفعيل"}</button>}
              {test._count.sessions === 0 && <button onClick={() => deleteTest(test)} className="rounded-lg border border-red-200 px-3 py-2 text-sm font-bold text-red-700">حذف</button>}
            </div>
          </article>)}
        </div>
      </section>

      <section className="rounded-2xl border bg-white p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-extrabold">بنك الأسئلة ({visibleQuestions.length})</h2>
          <div className="flex gap-2">
            <select value={skill} onChange={(event) => setSkill(event.target.value as SkillType | "ALL")} className="rounded-xl border p-2 text-sm"><option value="ALL">كل المهارات</option>{Object.values(SkillType).map((value) => <option key={value} value={value}>{labels[value]}</option>)}</select>
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="بحث في الأسئلة" className="rounded-xl border p-2 text-sm" />
          </div>
        </div>
        <div className="divide-y">
          {visibleQuestions.map((question) => <article key={question.id} className="flex items-start justify-between gap-4 py-4">
            <div><p className="font-bold">{question.contentText}</p><p className="mt-1 text-xs text-slate-500">{labels[question.skill]} · {question.questionType} · {question.difficultyLevel} · {question.points} درجة</p></div>
            <div className="flex shrink-0 gap-3">
              <button onClick={() => editQuestion(question)} className="text-sm font-bold text-blue-700">تعديل النص</button>
              <button onClick={() => deleteQuestion(question.id)} className="text-sm font-bold text-red-700">حذف</button>
            </div>
          </article>)}
          {!visibleQuestions.length && <p className="py-6 text-center text-sm text-slate-500">لا توجد أسئلة مطابقة.</p>}
        </div>
      </section>
    </main>
  );
}
