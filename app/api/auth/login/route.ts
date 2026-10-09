import { createSessionToken, sessionCookie, verifyPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { jsonError, readJson } from "@/lib/http";

type Login = { username?: string; password?: string };

export async function POST(request: Request) {
  let body: Login;
  try {
    body = await readJson<Login>(request);
  } catch {
    return jsonError("بيانات الطلب غير صالحة.");
  }
  const username = body.username?.trim().toLowerCase();
  if (!username || !body.password) return jsonError("أدخل اسم المستخدم وكلمة المرور.", 401);
  const user = await prisma.user.findUnique({ where: { username } });
  if (!user || !(await verifyPassword(body.password, user.passwordHash))) {
    return jsonError("اسم المستخدم أو كلمة المرور غير صحيحة.", 401);
  }
  return Response.json(
    { user: { id: user.id, username: user.username, fullName: user.fullName, role: user.role } },
    { headers: { "Set-Cookie": sessionCookie(createSessionToken(user.id)) } },
  );
}
