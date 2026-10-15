import { createHmac, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

export const SESSION_COOKIE = 'seen_session';
export const SESSION_MAX_AGE = 60 * 60 * 8;

function getSessionSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret || Buffer.byteLength(secret) < 32) {
    throw new Error('AUTH_SECRET must contain at least 32 bytes');
  }
  return secret;
}

export function assertAuthConfigured(): void {
  getSessionSecret();
}

function sign(payload: string): string {
  return createHmac('sha256', getSessionSecret())
    .update(payload)
    .digest('base64url');
}

export function createSessionToken(userId: string, sessionVersion = 0): string {
  const payload = Buffer.from(
    JSON.stringify({
      sub: userId,
      ver: sessionVersion,
      exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE,
    }),
  ).toString('base64url');
  return `${payload}.${sign(payload)}`;
}

function getSessionIdentity(token: string): { userId: string; sessionVersion: number } | null {
  const [payload, signature, extra] = token.split('.');
  if (!payload || !signature || extra) return null;

  const expected = Buffer.from(sign(payload));
  const received = Buffer.from(signature);
  if (expected.length !== received.length || !timingSafeEqual(expected, received)) {
    return null;
  }

  try {
    const session: unknown = JSON.parse(
      Buffer.from(payload, 'base64url').toString('utf8'),
    );
    if (
      !session ||
      typeof session !== 'object' ||
      !('sub' in session) ||
      typeof session.sub !== 'string' ||
      !('ver' in session) ||
      typeof session.ver !== 'number' ||
      !('exp' in session) ||
      typeof session.exp !== 'number' ||
      session.exp <= Math.floor(Date.now() / 1000)
    ) {
      return null;
    }
    return { userId: session.sub, sessionVersion: session.ver };
  } catch {
    return null;
  }
}

export async function getSessionUser() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const identity = getSessionIdentity(token);
  if (!identity) return null;

  const user = await prisma.user.findUnique({
    where: { id: identity.userId },
    select: { id: true, email: true, name: true, role: true, sessionVersion: true },
  });
  if (!user || user.sessionVersion !== identity.sessionVersion) return null;
  return { id: user.id, email: user.email, name: user.name, role: user.role };
}
