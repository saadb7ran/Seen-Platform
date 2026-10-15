import { Suspense, type ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth';

async function TestAccess({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ id: string }>;
}) {
  const user = await getSessionUser();
  if (!user) {
    const { id } = await params;
    redirect(`/auth?next=${encodeURIComponent(`/test/${id}`)}`);
  }
  if (user.role !== 'STUDENT' && user.role !== 'EXAMINER') redirect('/');
  return children;
}

export default function TestLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={<main className="min-h-screen bg-slate-950" />}>
      <TestAccess params={params}>{children}</TestAccess>
    </Suspense>
  );
}
