import { PrismaClient, UserRole } from "@prisma/client";
import { randomBytes, scrypt as scryptCallback } from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(scryptCallback);
const prisma = new PrismaClient();

try {
  const username = process.env.PLATFORM_ADMIN_USERNAME?.trim().toLowerCase();
  const password = process.env.PLATFORM_ADMIN_PASSWORD;
  const fullName = process.env.PLATFORM_ADMIN_NAME?.trim();
  if (!username || !/^[a-z0-9_.-]{3,100}$/.test(username) || !password || password.length < 12 || !fullName) {
    throw new Error("Set PLATFORM_ADMIN_USERNAME, PLATFORM_ADMIN_PASSWORD (12+ chars), and PLATFORM_ADMIN_NAME.");
  }
  const existing = await prisma.user.findUnique({ where: { username }, select: { id: true } });
  if (existing) throw new Error("That username already exists; refusing to change an existing account.");
  const salt = randomBytes(16).toString("hex");
  const derivedKey = await scrypt(password, salt, 64);
  await prisma.user.create({
    data: { username, fullName, passwordHash: `${salt}:${derivedKey.toString("hex")}`, role: UserRole.ADMIN },
  });
  console.log(`Created platform administrator: ${username}`);
} catch (error) {
  console.error(error instanceof Error ? error.message : "Failed to create platform administrator.");
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
