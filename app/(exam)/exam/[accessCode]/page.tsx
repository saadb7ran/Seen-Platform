"use client";



import React, { useState, useEffect } from "react";

import {

Clock,

Volume2,

Mic,

Square,

Play,

RotateCcw,

CheckCircle,

ArrowRight,

ShieldAlert,

Send,

FileText

} from "lucide-react";

import { useParams, useRouter } from "next/navigation";



export default function StudentExamPage() {

const params = useParams();

const router = useRouter();

const accessCode = params.accessCode as string;



const [totalSeconds, setTotalSeconds] = useState(2400); // 40 دقيقة

const [questionSeconds, setQuestionSeconds] = useState(180);

const [activeSkill, setActiveSkill] = useState<"LISTENING" | "SPEAKING" | "READING" | "WRITING">("SPEAKING");


const [listenPlayCount, setListenPlayCount] = useState(1);

const [isPlayingAudio, setIsPlayingAudio] = useState(false);



const [isRecording, setIsRecording] = useState(false);

const [recordSeconds, setRecordSeconds] = useState(0);

const [hasRecordedAudio, setHasRecordedAudio] = useState(false);

const [reRecordCount, setReRecordCount] = useState(0);



const [essayText, setEssayText] = useState("");

const wordCount = essayText.trim() ? essayText.trim().split(/\s+/).length : 0;



useEffect(() => {

const timer = setInterval(() => {

setTotalSeconds((prev) => (prev > 0 ? prev - 1 : 0));

setQuestionSeconds((prev) => (prev > 0 ? prev - 1 : 0));

}, 1000);

return () => clearInterval(timer);

}, []);



useEffect(() => {

let recTimer: NodeJS.Timeout;

if (isRecording) {

recTimer = setInterval(() => {

setRecordSeconds((s) => {

if (s >= 60) {

setIsRecording(false);

setHasRecordedAudio(true);

return 60;

}

return s + 1;

});

}, 1000);

}

return () => clearInterval(recTimer);

}, [isRecording]);



const formatTime = (secs: number) => {

const m = Math.floor(secs / 60);

const s = secs % 60;

return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;

};



const handleStartRecording = () => {

if (reRecordCount >= 1 && hasRecordedAudio) return;

setIsRecording(true);

setRecordSeconds(0);

};



const handleStopRecording = () => {

setIsRecording(false);

setHasRecordedAudio(true);

};



const handleReRecord = () => {

if (reRecordCount < 1) {

setReRecordCount((c) => c + 1);

setHasRecordedAudio(false);

setRecordSeconds(0);

setIsRecording(true);

}

};



const handleSubmitExam = () => {

const confirmSubmit = window.confirm("Are you sure you want to finalize and submit your assessment for automated AI grading?");

if (confirmSubmit) {

router.push("/report/SN-CEFR-2025-9821A");

}

};



return (

<div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col font-sans" dir="ltr">

<header className="border-b border-slate-200 bg-white sticky top-0 z-50">

<div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">


<div className="flex items-center gap-4">

<div className="w-9 h-9 rounded-xl bg-[#0d5f2a] text-white flex items-center justify-center font-bold text-lg">

S

</div>

<div>

<div className="flex items-center gap-2">

<span className="font-extrabold text-sm sm:text-base text-slate-900 tracking-tight">Seen Platform</span>

<span className="text-[11px] font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-semibold border border-slate-200">

CODE: {accessCode || "SEEN-2025"}

</span>

</div>

<p className="text-[11px] text-slate-400">High School CEFR Placement Examination</p>

</div>

</div>



<div className="flex items-center gap-3 sm:gap-6">

<div className="hidden sm:flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200">

<Clock className="w-3.5 h-3.5 text-amber-600" />

<span>Section: <strong className="font-mono">{formatTime(questionSeconds)}</strong></span>

</div>



<div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold tracking-wider font-mono">

<Clock className="w-3.5 h-3.5 text-emerald-400" />

<span>{formatTime(totalSeconds)}</span>

</div>



<button

onClick={handleSubmitExam}

className="bg-[#0d5f2a] hover:bg-[#09451e] text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"

>

<span>Submit Test</span>

<Send className="w-3.5 h-3.5" />

</button>

</div>

</div>

</header>



<div className="bg-white border-b border-slate-200">

<div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between overflow-x-auto">

<div className="flex items-center gap-2 min-w-max">

<button

onClick={() => setActiveSkill("LISTENING")}

className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${

activeSkill === "LISTENING" ? "bg-[#0d5f2a] text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"

}`}

>

<span>1. Listening</span>

<span className="text-[10px] opacity-80">(Complete)</span>

</button>



<button

onClick={() => setActiveSkill("SPEAKING")}

className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${

activeSkill === "SPEAKING" ? "bg-[#0d5f2a] text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"

}`}

>

<span>2. Speaking</span>

<span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>

</button>



<button

onClick={() => setActiveSkill("READING")}

className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${

activeSkill === "READING" ? "bg-[#0d5f2a] text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"

}`}

>

<span>3. Reading</span>

<span className="text-[10px] opacity-80">(Pending)</span>

</button>



<button

onClick={() => setActiveSkill("WRITING")}

className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${

activeSkill === "WRITING" ? "bg-[#0d5f2a] text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"

}`}

>

<span>4. Writing</span>

<span className="text-[10px] opacity-80">(Pending)</span>

</button>

</div>



<div className="text-xs text-slate-500 font-medium hidden md:block">

Target CEFR Benchmark: <strong>Level B1 - B2</strong>

</div>

</div>

</div>



<main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

<div className="lg:col-span-7 space-y-6">

<div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">

<div className="flex items-center justify-between border-b border-slate-100 pb-3">

<div className="flex items-center gap-2">

<span className="px-2.5 py-1 bg-emerald-100 text-[#0d5f2a] text-xs font-extrabold rounded-md">

TASK 02 / 04

</span>

<span className="text-xs font-bold text-slate-500 uppercase">

{activeSkill} ASSESSMENT

</span>

</div>

<span className="text-xs font-semibold text-slate-400">Question Weight: 5.0 Pts</span>

</div>



{activeSkill === "SPEAKING" && (

<div className="space-y-4">

<h2 className="text-lg font-bold text-slate-900 leading-snug">

Describe a memorable school event or project that inspired you. Explain what happened, your personal contribution, and what you learned from it.

</h2>


<div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-2">

<p className="font-bold text-slate-800">Speaking Evaluation Criteria:</p>

<ul className="list-disc list-inside space-y-1 text-slate-600">

<li>Fluency & Spontaneous Coherence (natural pace without long pauses).</li>

<li>Phonetic Pronunciation and clear intonation.</li>

<li>Grammatical accuracy and appropriate use of academic connectors.</li>

</ul>

</div>



<div className="p-3.5 bg-emerald-50/70 rounded-xl border border-emerald-200 flex items-center justify-between">

<div className="flex items-center gap-3">

<button

onClick={() => setIsPlayingAudio(!isPlayingAudio)}

className="w-9 h-9 rounded-full bg-[#0d5f2a] text-white flex items-center justify-center hover:bg-[#09451e] transition-colors"

>

{isPlayingAudio ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}

</button>

<div>

<p className="text-xs font-bold text-slate-800">Examiner Prompt Audio</p>

<p className="text-[11px] text-slate-500">Listen to the spoken instruction (Plays: {listenPlayCount}/2)</p>

</div>

</div>

<span className="text-xs font-mono font-bold text-[#0d5f2a]">00:18</span>

</div>

</div>

)}



{activeSkill === "WRITING" && (

<div className="space-y-4">

<h2 className="text-lg font-bold text-slate-900 leading-snug">

Write an essay (120–150 words) discussing the benefits and drawbacks of using artificial intelligence tools in modern classrooms.

</h2>

<div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center gap-2">

<ShieldAlert className="w-4 h-4 flex-shrink-0 text-amber-600" />

<span>Clipboard copy & paste is strictly disabled to ensure academic integrity.</span>

</div>

</div>

)}



{activeSkill === "READING" && (

<div className="space-y-4">

<h2 className="text-base font-bold text-slate-900">Passage 1: Renewable Energy Initiatives in the Gulf</h2>

<p className="text-xs sm:text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200">

Over the past decade, solar energy has transitioned from an ambitious concept to a primary pillar of national sustainable development. The vast desert expanses coupled with advanced photovoltaic technology allow regional projects to supply millions of homes with zero-emission electricity...

</p>

</div>

)}



{activeSkill === "LISTENING" && (

<div className="space-y-4">

<h2 className="text-base font-bold text-slate-900">Audio Lecture: Marine Biology of the Red Sea</h2>

<div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">

<div className="flex items-center gap-3">

<div className="w-10 h-10 rounded-xl bg-[#0d5f2a] text-white flex items-center justify-center">

<Volume2 className="w-5 h-5" />

</div>

<div>

<p className="text-xs font-bold text-slate-800">Part 1 - Research Findings</p>

<p className="text-[11px] text-slate-500">Notice: Seeking bar is disabled</p>

</div>

</div>

<span className="text-xs font-mono font-bold text-slate-700">01:45 / 02:30</span>

</div>

</div>

)}

</div>

</div>



<div className="lg:col-span-5 space-y-6">

<div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">

<h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">

<FileText className="w-4 h-4 text-[#0d5f2a]" />

Candidate Response Workspace

</h3>



{activeSkill === "SPEAKING" && (

<div className="space-y-5">

<div className="p-6 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/60 flex flex-col items-center justify-center text-center space-y-4">

<div className="h-16 flex items-center gap-1.5 px-4">

{[30, 65, 45, 90, 80, 40, 75, 95, 30, 50, 85, 60, 40, 70, 90, 45].map((h, i) => (

<span

key={i}

className={`w-1 rounded-full transition-all duration-150 ${

isRecording ? "bg-[#0d5f2a] animate-pulse" : "bg-slate-300"

}`}

style={{ height: isRecording ? `${h}%` : "15%" }}

/>

))}

</div>



<div className="font-mono text-2xl font-bold text-slate-800">

{formatTime(recordSeconds)} <span className="text-xs text-slate-400 font-sans">/ 01:00 Max</span>

</div>



<div className="flex items-center gap-3">

{!isRecording && !hasRecordedAudio && (

<button

onClick={handleStartRecording}

className="px-5 py-2.5 rounded-xl bg-[#0d5f2a] hover:bg-[#09451e] text-white text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer"

>

<Mic className="w-4 h-4" />

Start Speaking Now

</button>

)}



{isRecording && (

<button

onClick={handleStopRecording}

className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all shadow-md flex items-center gap-2 animate-pulse cursor-pointer"

>

<Square className="w-4 h-4" />

Finish & Stop Recording

</button>

)}



{hasRecordedAudio && !isRecording && (

<div className="space-y-2 w-full">

<div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-[#0d5f2a] font-bold flex items-center justify-center gap-1.5">

<CheckCircle className="w-4 h-4 text-emerald-600" />

Audio Recording Stored Successfully

</div>



{reRecordCount < 1 ? (

<button

onClick={handleReRecord}

className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center justify-center gap-1 mx-auto cursor-pointer"

>

<RotateCcw className="w-3.5 h-3.5" /> Re-record once (1 attempt remaining)

</button>

) : (

<p className="text-[11px] text-slate-400 text-center">Maximum re-record limit reached (1/1)</p>

)}

</div>

)}

</div>

</div>



<div className="text-[11px] text-slate-400 space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-200">

<p>• Audio converts to WebM/Opus and uploads to Supabase Encrypted Storage.</p>

<p>• Automated Whisper transcription will analyze pronunciation and fluency.</p>

</div>

</div>

)}



{activeSkill === "WRITING" && (

<div className="space-y-3">

<div className="flex items-center justify-between text-xs text-slate-600 font-semibold">

<span>Target Range: 120–150 Words</span>

<span className={`font-mono font-bold ${wordCount >= 120 && wordCount <= 160 ? "text-emerald-600" : "text-slate-700"}`}>

Current Words: {wordCount}

</span>

</div>



<textarea

rows={10}

value={essayText}

onChange={(e) => setEssayText(e.target.value)}

onPaste={(e) => {

e.preventDefault();

alert("Pasting text is disabled to enforce test integrity.");

}}

placeholder="Type your essay response directly here in English..."

className="w-full p-4 rounded-xl border border-slate-300 focus:border-[#0d5f2a] focus:ring-2 focus:ring-[#0d5f2a]/20 outline-none text-xs sm:text-sm font-sans leading-relaxed text-slate-900 resize-none"

/>



<div className="flex items-center justify-between text-[11px] text-slate-400">

<span>Auto-saved to cloud every 3 seconds</span>

<span>CEFR Rubric: Grammar, Lexicon & Coherence</span>

</div>

</div>

)}



<div className="pt-2 border-t border-slate-100 flex items-center justify-between">

<button

onClick={() => alert("Marked for quick review before final submission.")}

className="text-xs font-semibold text-slate-500 hover:text-slate-800 cursor-pointer"

>

Flag for Review

</button>



<button

onClick={() => {

if (activeSkill === "SPEAKING") setActiveSkill("WRITING");

else if (activeSkill === "WRITING") setActiveSkill("READING");

else if (activeSkill === "READING") setActiveSkill("LISTENING");

}}

className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"

>

<span>Save & Continue</span>

<ArrowRight className="w-3.5 h-3.5" />

</button>

</div>

</div>

</div>



</main>

</div>

);
}