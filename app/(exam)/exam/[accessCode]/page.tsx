"use client";

import { QuestionType, SkillType } from "@prisma/client";
import { FormEvent, useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { readJsonResponse } from "@/lib/client-http";

type ExamQuestion = {
  id: string;
  skill: SkillType;
  questionType: QuestionType;
  contentText: string;
  mediaUrl: string | null;
  options: unknown;
  points: number;
  answer?: { selectedOption: string | null; textAnswer: string | null };
};
type ExamData = { id: string; title: string; durationMinutes: number; questionCount: number; questions: ExamQuestion[] };
type Answers = Record<string, { selectedOption: string; textAnswer: string }>;
const skillNames: Record<SkillType, string> = {
  LISTENING: "الاستماع",
  SPEAKING: "التحدث",
  READING: "القراءة",
  WRITING: "الكتابة",
};

async function responseJson<T>(response: Response) {
  return readJsonResponse<T>(response, "تعذر تنفيذ العملية.");
}

export default function StudentExamPage() {
  const params = useParams<{ accessCode: string }>();
  const accessCode = params.accessCode;
  const router = useRouter();
  const recorder = useRef<MediaRecorder | null>(null);
  const recordingChunks = useRef<Blob[]>([]);
  const [test, setTest] = useState<ExamData | null>(null);
  const [sessionId, setSessionId] = useState("");
  const [answers, setAnswers] = useState<Answers>({});
  const [recordings, setRecordings] = useState<Record<string, Blob>>({});
  const [recordingQuestionId, setRecordingQuestionId] = useState("");
  const [error, setError] = useState("");
  const [busyQuestion, setBusyQuestion] = useState("");
  const [busy, setBusy] = useState(false);
  const [resultCertificate, setResultCertificate] = useState("");
  const [sessionStatus, setSessionStatus] = useState("");
  const [remainingSeconds, setRemainingSeconds] = useState(0);

  async function loadSession(id: string) {
    const response = await fetch(`/api/sessions/${id}`);
    const { session } = await responseJson<{ session: { status: string; deadlineAt: string; test: { id: string; title: string; durationMinutes: number; questions: ExamQuestion[] }; certificateId: string | null } }>(response);
    setSessionStatus(session.status);
    if (session.status !== "IN_PROGRESS") {
      setResultCertificate(session.certificateId ?? "");
      return;
    }
    setTest({ id: session.test.id, title: session.test.title, durationMinutes: session.test.durationMinutes, questionCount: session.test.questions.length, questions: session.test.questions });
    setAnswers(Object.fromEntries(session.test.questions.map((question) => [question.id, {
      selectedOption: question.answer?.selectedOption ?? "",
      textAnswer: question.answer?.textAnswer ?? "",
    }])));
    setRemainingSeconds(Math.max(0, Math.ceil((new Date(session.deadlineAt).getTime() - Date.now()) / 1000)));
  }

  useEffect(() => {
    let cancelled = false;
    async function initialize() {
      try {
        const response = await fetch(`/api/exams/${encodeURIComponent(accessCode)}`);
        const { test: testData } = await responseJson<{ test: ExamData }>(response);
        if (cancelled) return;
        setTest(testData);
        const existingSessionId = new URLSearchParams(window.location.search).get("session");
        if (existingSessionId) {
          setSessionId(existingSessionId);
          await loadSession(existingSessionId);
        }
      } catch (reason) {
        if (!cancelled) setError(reason instanceof Error ? reason.message : "تعذر تحميل الاختبار.");
      }
    }
    initialize().catch((reason: unknown) => {
      if (!cancelled) setError(reason instanceof Error ? reason.message : "تعذر تحميل الاختبار.");
    });
    return () => { cancelled = true; };
  }, [accessCode]);

  useEffect(() => {
    if (!sessionId || remainingSeconds <= 0) return;
    const timer = window.setInterval(() => setRemainingSeconds((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [sessionId, remainingSeconds]);

  async function startExam() {
    setError("");
    setBusy(true);
    try {
      const response = await fetch(`/api/exams/${encodeURIComponent(accessCode)}`, { method: "POST" });
      const { sessionId: id } = await responseJson<{ sessionId: string }>(response);
      setSessionId(id);
      router.replace(`/exam/${encodeURIComponent(accessCode)}?session=${id}`);
      await loadSession(id);
    } catch (reason) {
      if (reason instanceof Error && reason.message.includes("سجّل الدخول")) {
        router.push(`/login?next=${encodeURIComponent(`/exam/${accessCode}`)}`);
      } else {
        setError(reason instanceof Error ? reason.message : "تعذر بدء الاختبار.");
      }
    } finally {
      setBusy(false);
    }
  }

  function updateAnswer(questionId: string, patch: Partial<Answers[string]>) {
    setAnswers((current) => ({ ...current, [questionId]: { ...current[questionId], ...patch } }));
  }

  async function saveAnswer(question: ExamQuestion) {
    if (!sessionId) return;
    setBusyQuestion(question.id);
    setError("");
    try {
      let audioRecordingUrl: string | undefined;
      const recording = recordings[question.id];
      if (recording) {
        const contentType = recording.type || "audio/webm";
        const signed = await responseJson<{ uploadUrl: string; key: string }>(await fetch("/api/uploads/audio", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId, questionId: question.id, contentType, size: recording.size }),
        }));
        const uploaded = await fetch(signed.uploadUrl, { method: "PUT", headers: { "Content-Type": contentType }, body: recording });
        if (!uploaded.ok) throw new Error("تعذر رفع التسجيل الصوتي إلى التخزين.");
        audioRecordingUrl = signed.key;
      }
      await responseJson(await fetch(`/api/sessions/${sessionId}/answers/${question.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...answers[question.id], audioRecordingUrl }),
      }));
      setRecordings((current) => {
        const next = { ...current };
        delete next[question.id];
        return next;
      });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "تعذر حفظ الإجابة.");
      throw reason;
    } finally {
      setBusyQuestion("");
    }
  }

  async function submitExam(event?: FormEvent) {
    event?.preventDefault();
    if (!sessionId || !test) return;
    setBusy(true);
    setError("");
    try {
      if (remainingSeconds > 0) {
        for (const question of test.questions) await saveAnswer(question);
      }
      const response = await fetch(`/api/sessions/${sessionId}/submit`, { method: "POST" });
      const data = await responseJson<{ result?: { certificateId: string }; message?: string }>(response);
      if (data.result?.certificateId) {
        setResultCertificate(data.result.certificateId);
        setSessionStatus("GRADED");
      } else {
        setSessionStatus("SUBMITTED");
        setError(data.message ?? "تم تسليم الاختبار.");
      }
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "تعذر تسليم الاختبار.");
    } finally {
      setBusy(false);
    }
  }

  async function beginRecording(questionId: string) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      recordingChunks.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      recorder.current = mediaRecorder;
      let recordingSize = 0;
      mediaRecorder.ondataavailable = (event) => {
        if (!event.data.size) return;
        recordingSize += event.data.size;
        if (recordingSize > 15 * 1024 * 1024) {
          recordingChunks.current = [];
          setError("حجم التسجيل تجاوز الحد الأقصى (15 ميغابايت).");
          mediaRecorder.stop();
          return;
        }
        recordingChunks.current.push(event.data);
      };
      mediaRecorder.onstop = () => {
        if (recordingChunks.current.length) {
          setRecordings((current) => ({ ...current, [questionId]: new Blob(recordingChunks.current, { type: mediaRecorder.mimeType || "audio/webm" }) }));
        }
        setRecordingQuestionId("");
        stream.getTracks().forEach((track) => track.stop());
      };
      mediaRecorder.start();
      setRecordingQuestionId(questionId);
    } catch {
      setError("تعذر الوصول إلى الميكروفون. تحقق من الإذن واتصال HTTPS.");
    }
  }

  const formatTime = (seconds: number) => `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
  if (resultCertificate) return (
    <main dir="rtl" className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <section className="max-w-lg rounded-2xl border bg-white p-8 text-center space-y-4">
        <h1 className="text-2xl font-black">تم تصحيح الاختبار</h1>
        <p>رقم الشهادة: <span className="font-mono font-bold">{resultCertificate}</span></p>
        <Link href={`/report/${resultCertificate}`} className="inline-block rounded-xl bg-emerald-800 px-5 py-3 text-white font-bold">عرض النتيجة والشهادة</Link>
      </section>
    </main>
  );
  if (sessionStatus === "SUBMITTED") return (
    <main dir="rtl" className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <section className="max-w-lg rounded-2xl border bg-white p-8 text-center space-y-3"><h1 className="text-2xl font-black">تم تسليم الاختبار</h1><p className="text-slate-600">الإجابات المفتوحة بانتظار المراجعة والتصحيح من فريق المنصة.</p><Link href="/account" className="text-emerald-800 font-bold underline">العودة إلى حسابك</Link></section>
    </main>
  );

  return (
    <main dir="rtl" className="min-h-screen bg-slate-50 p-5 sm:p-8">
      <div className="mx-auto max-w-3xl space-y-6">
        <header className="rounded-2xl bg-white p-6 border">
          <Link href="/" className="text-sm text-emerald-800 font-bold">منصة سين</Link>
          <h1 className="mt-2 text-2xl font-black">{test?.title ?? "تحميل الاختبار..."}</h1>
          {sessionId && <p className="mt-2 font-mono font-bold">الوقت المتبقي: {formatTime(remainingSeconds)}</p>}
        </header>
        {error && <p role="alert" className="rounded-xl bg-red-50 p-4 text-red-800">{error}</p>}
        {!sessionId && test && <section className="rounded-2xl border bg-white p-6 space-y-4">
          <p>عدد الأسئلة: {test.questionCount} · المدة: {test.durationMinutes} دقيقة</p>
          <button onClick={startExam} disabled={busy} className="rounded-xl bg-emerald-800 px-5 py-3 text-white font-bold disabled:opacity-50">بدء الاختبار</button>
        </section>}
        {sessionId && test && <form onSubmit={submitExam} className="space-y-4">
          {test.questions.map((question, index) => {
            const options = Array.isArray(question.options) ? question.options.filter((item): item is string => typeof item === "string") : [];
            const answer = answers[question.id] ?? { selectedOption: "", textAnswer: "" };
            const recording = recordings[question.id];
            return <article key={question.id} className="rounded-2xl border bg-white p-5 space-y-4">
              <div className="flex justify-between gap-3">
                <div><p className="text-sm font-bold text-emerald-800">{index + 1}. {skillNames[question.skill]} · {question.questionType}</p><h2 className="mt-2 font-bold">{question.contentText}</h2></div>
                <span className="shrink-0 text-sm">{question.points} درجة</span>
              </div>
              {question.mediaUrl && <audio controls src={question.mediaUrl} className="w-full" />}
              {question.questionType === QuestionType.MCQ ? <fieldset className="space-y-2">
                {options.map((option) => <label key={option} className="flex items-center gap-3 rounded-xl border p-3"><input type="radio" name={question.id} checked={answer.selectedOption === option} disabled={remainingSeconds === 0} onChange={() => updateAnswer(question.id, { selectedOption: option })} /><span>{option}</span></label>)}
              </fieldset> : <>
                {question.questionType === QuestionType.AUDIO_PROMPT && <div className="flex gap-2">
                  {recordingQuestionId !== question.id
                    ? <button type="button" disabled={remainingSeconds === 0} onClick={() => beginRecording(question.id)} className="rounded-xl border px-4 py-2 font-bold disabled:opacity-50">تسجيل الإجابة الصوتية</button>
                    : <button type="button" onClick={() => recorder.current?.stop()} className="rounded-xl border border-red-300 px-4 py-2 font-bold text-red-700">إيقاف التسجيل</button>}
                  {recording && <span className="self-center text-sm text-emerald-800">تم التسجيل؛ احفظ الإجابة لرفعها.</span>}
                </div>}
                {question.questionType !== QuestionType.AUDIO_PROMPT && <textarea value={answer.textAnswer} disabled={remainingSeconds === 0} onChange={(event) => updateAnswer(question.id, { textAnswer: event.target.value })} rows={6} maxLength={20000} placeholder="اكتب إجابتك هنا..." className="w-full rounded-xl border p-3" />}
              </>}
              <button type="button" disabled={busyQuestion === question.id || remainingSeconds === 0} onClick={() => saveAnswer(question).catch(() => undefined)} className="rounded-lg border px-3 py-2 text-sm font-bold disabled:opacity-50">{busyQuestion === question.id ? "جارٍ الحفظ..." : remainingSeconds === 0 ? "انتهى وقت الحفظ" : "حفظ الإجابة"}</button>
            </article>;
          })}
          <button disabled={busy} className="rounded-xl bg-emerald-800 px-5 py-3 font-bold text-white disabled:opacity-50">{busy ? "جارٍ تسليم الإجابات..." : remainingSeconds === 0 ? "انتهى الوقت — تسليم الإجابات المحفوظة" : "تسليم الاختبار"}</button>
        </form>}
      </div>
    </main>
  );
}
