import { Suspense, type ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth';

async function AdminAccess({ children }: { children: ReactNode }) {
  const user = await getSessionUser();
  if (!user) redirect('/auth');
  if (user.role !== 'ADMIN') redirect('/');
  return children;
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<main className="min-h-screen bg-slate-950" />}>
      <AdminAccess>{children}</AdminAccess>
    </Suspense>
  );
}
