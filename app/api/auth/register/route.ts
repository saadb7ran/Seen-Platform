import { Prisma } from "@prisma/client";
import { hashPassword, createSessionToken, sessionCookie } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { jsonError, readJson } from "@/lib/http";

type Registration = {
  username?: string;
  password?: string;
  fullName?: string;
  gradeLevel?: number;
};

export async function POST(request: Request) {
  let body: Registration;
  try {
    body = await readJson<Registration>(request);
  } catch {
    return jsonError("بيانات الطلب غير صالحة.");
  }

  const username = body.username?.trim().toLowerCase();
  const fullName = body.fullName?.trim();
  const password = body.password;
  if (!username || !/^[a-z0-9_.-]{3,100}$/.test(username)) {
    return jsonError("اسم المستخدم مطلوب ويجب أن يتكون من 3 إلى 100 حرف أو رقم.");
  }
  if (!fullName || fullName.length > 255) return jsonError("يرجى إدخال الاسم الكامل.");
  if (!password || password.length < 12 || password.length > 128) {
    return jsonError("كلمة المرور يجب أن تتكون من 12 حرفًا على الأقل.");
  }
  if (body.gradeLevel !== undefined && (!Number.isInteger(body.gradeLevel) || body.gradeLevel < 1 || body.gradeLevel > 12)) {
    return jsonError("الصف الدراسي غير صالح.");
  }

  try {
    const user = await prisma.user.create({
      data: {
        username,
        fullName,
        passwordHash: await hashPassword(password),
        role: "STUDENT",
        gradeLevel: body.gradeLevel,
      },
      select: { id: true, username: true, fullName: true, role: true },
    });
    return Response.json({ user }, { status: 201, headers: { "Set-Cookie": sessionCookie(createSessionToken(user.id)) } });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return jsonError("اسم المستخدم مستخدم بالفعل.", 409);
    }
    console.error("Student registration failed", error);
    return jsonError("تعذر إنشاء الحساب حاليًا.", 500);
  }
}
