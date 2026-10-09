import { createHmac, randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { cookies } from "next/headers";
import { UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const scrypt = promisify(scryptCallback);
const SESSION_COOKIE = "seen_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

export type AuthUser = {
  id: string;
  username: string;
  fullName: string;
  role: UserRole;
};

function sessionSecret() {
  const secret = process.env.SESSION_SECRET ?? process.env.NEXTAUTH_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("SESSION_SECRET must contain at least 32 characters.");
  }
  return secret;
}

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = (await scrypt(password, salt, 64)) as Buffer;
  return `${salt}:${derivedKey.toString("hex")}`;
}

export async function verifyPassword(password: string, storedHash: string) {
  const [salt, expectedHex] = storedHash.split(":");
  if (!salt || !expectedHex || !/^[a-f0-9]{128}$/i.test(expectedHex)) return false;
  const actual = (await scrypt(password, salt, 64)) as Buffer;
  const expected = Buffer.from(expectedHex, "hex");
  return timingSafeEqual(actual, expected);
}

export function createSessionToken(userId: string) {
  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_MAX_AGE;
  const payload = `${userId}.${expiresAt}`;
  const signature = createHmac("sha256", sessionSecret()).update(payload).digest("base64url");
  return `${payload}.${signature}`;
}

function parseSessionToken(token: string) {
  const [userId, expiresAtText, signature] = token.split(".");
  if (!userId || !expiresAtText || !signature) return null;
  const expiresAt = Number(expiresAtText);
  if (!Number.isSafeInteger(expiresAt) || expiresAt <= Date.now() / 1000) return null;
  const payload = `${userId}.${expiresAtText}`;
  const expected = createHmac("sha256", sessionSecret()).update(payload).digest();
  let provided: Buffer;
  try {
    provided = Buffer.from(signature, "base64url");
  } catch {
    return null;
  }
  if (provided.length !== expected.length || !timingSafeEqual(provided, expected)) return null;
  return userId;
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  let userId: string | null;
  try {
    userId = parseSessionToken(token);
  } catch {
    return null;
  }
  if (!userId) return null;
  return prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, username: true, fullName: true, role: true },
  });
}

export function sessionCookie(token: string) {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${SESSION_COOKIE}=${token}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${SESSION_MAX_AGE}${secure}`;
}

export function clearSessionCookie() {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${SESSION_COOKIE}=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0${secure}`;
}

export function hasRole(user: AuthUser | null, ...roles: UserRole[]) {
  return user !== null && roles.includes(user.role);
}
