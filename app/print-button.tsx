"use client";

export default function PrintButton() {
  return <button onClick={() => window.print()} className="rounded-lg border bg-white px-4 py-2 text-sm font-bold">طباعة التقرير</button>;
}
