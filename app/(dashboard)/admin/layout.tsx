import { UserRole } from "@prisma/client";
import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/admin/dashboard");
  if (user.role !== UserRole.ADMIN && user.role !== UserRole.TEACHER) redirect("/");
  return children;
}
