import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/supabase/auth-user";

export async function GET(request: Request) {
  const auth = await getAuthenticatedUser(request);
  if (!auth) return NextResponse.json({ message: "Please sign in." }, { status: 401 });
  const user = await prisma.user.findFirst({ where: { OR: [{ authId: auth.id }, ...(auth.email ? [{ email: auth.email }] : [])] } });
  if (!user) return NextResponse.json({ message: "Complete onboarding first." }, { status: 409 });
  const [assignments, completed] = await Promise.all([
    prisma.taskAssignment.findMany({ where: { userId: user.id }, orderBy: [{ completed: "asc" }, { dueAt: "asc" }, { createdAt: "desc" }], include: { mission: { include: { career: { select: { name: true } } } }, assignedBy: { select: { fullName: true } } } }),
    prisma.submission.findMany({ where: { userId: user.id, status: "PASSED" }, select: { missionId: true }, distinct: ["missionId"] }),
  ]);
  const completedIds = new Set(completed.map(item => item.missionId));
  return NextResponse.json({ tasks: assignments.map(item => ({ ...item, completed: item.completed || completedIds.has(item.missionId) })) });
}
