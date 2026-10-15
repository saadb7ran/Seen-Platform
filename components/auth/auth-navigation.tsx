'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface SessionUser {
  name: string;
  role: 'ADMIN' | 'EXAMINER' | 'STUDENT';
}

function parseSessionUser(value: unknown): SessionUser | null {
  if (!value || typeof value !== 'object' || !('user' in value) || !value.user) return null;
  if (typeof value.user !== 'object') return null;
  const user = value.user as Record<string, unknown>;
  if (
    typeof user.name !== 'string' ||
    (user.role !== 'ADMIN' && user.role !== 'EXAMINER' && user.role !== 'STUDENT')
  ) {
    return null;
  }
  return { name: user.name, role: user.role };
}

export default function AuthNavigation() {
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    const loadSession = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.status === 401) {
          if (active) setUser(null);
          return;
        }
        if (!response.ok) throw new Error(`Session lookup failed (${response.status}).`);
        const data: unknown = await response.json();
        const currentUser = parseSessionUser(data);
        if (!currentUser) throw new Error('The session response is invalid.');
        if (active) setUser(currentUser);
      } catch (loadError) {
        console.error('Could not load the current session:', loadError);
        if (active) setError('تعذر التحقق من حالة تسجيل الدخول.');
      } finally {
        if (active) setIsLoading(false);
      }
    };
    void loadSession();
    return () => {
      active = false;
    };
  }, []);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    setError('');
    try {
      const response = await fetch('/api/auth/logout', { method: 'POST' });
      if (!response.ok) throw new Error(`Logout failed (${response.status}).`);
      setUser(null);
      router.refresh();
    } catch (signOutError) {
      console.error('Could not sign out:', signOutError);
      setError('تعذر تسجيل الخروج. أعد المحاولة.');
    } finally {
      setIsSigningOut(false);
    }
  };

  if (isLoading) return <span className="text-xs text-slate-500" aria-live="polite">جارٍ التحقق...</span>;
  if (!user) {
    return (
      <div className="flex flex-col items-end gap-1">
        <Link href="/auth" className="text-xs font-medium text-slate-300 hover:text-teal-400 transition-colors">
          تسجيل الدخول
        </Link>
        {error && <span role="status" className="text-[10px] text-rose-300">{error}</span>}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      {user.role === 'ADMIN' && (
        <Link href="/admin" className="text-xs font-semibold text-teal-400 hover:underline">
          لوحة الإدارة
        </Link>
      )}
      <span className="hidden sm:inline text-xs text-slate-300">{user.name}</span>
      <button
        type="button"
        onClick={handleSignOut}
        disabled={isSigningOut}
        className="text-xs font-medium text-slate-300 hover:text-teal-400 disabled:opacity-50"
      >
        {isSigningOut ? 'جارٍ الخروج...' : 'تسجيل الخروج'}
      </button>
      {error && <span role="status" className="sr-only">{error}</span>}
    </div>
  );
}
