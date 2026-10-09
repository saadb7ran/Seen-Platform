import { Prisma, UserRole } from "@prisma/client";
import { getCurrentUser, hasRole, hashPassword } from "@/lib/auth";
import { jsonError, readJson } from "@/lib/http";
import { prisma } from "@/lib/prisma";

type StaffInput = { username?: string; password?: string; fullName?: string };

export async function POST(request: Request) {
  const actor = await getCurrentUser();
  if (!hasRole(actor, UserRole.ADMIN)) return jsonError("إنشاء حسابات الفريق متاح لمدير المنصة فقط.", 403);
  let body: StaffInput;
  try {
    body = await readJson(request);
  } catch {
    return jsonError("بيانات الحساب غير صالحة.");
  }
  const username = body.username?.trim().toLowerCase();
  const fullName = body.fullName?.trim();
  if (!username || !/^[a-z0-9_.-]{3,100}$/.test(username)) return jsonError("اسم المستخدم غير صالح.");
  if (!fullName || fullName.length > 255) return jsonError("الاسم الكامل مطلوب.");
  if (!body.password || body.password.length < 12 || body.password.length > 128) return jsonError("كلمة المرور يجب أن تتكون من 12 حرفًا على الأقل.");
  try {
    const user = await prisma.user.create({
      data: { username, fullName, passwordHash: await hashPassword(body.password), role: UserRole.TEACHER },
      select: { id: true, username: true, fullName: true, role: true },
    });
    return Response.json({ user }, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") return jsonError("اسم المستخدم مستخدم بالفعل.", 409);
    console.error("Staff account creation failed", error);
    return jsonError("تعذر إنشاء الحساب.", 500);
  }
}
