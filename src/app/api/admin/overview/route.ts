import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdmin } from "@/lib/admin";

export async function GET(request: Request) {
  const admin = await getAdmin(request);
  if (!admin.ok) return NextResponse.json({ message: admin.error }, { status: admin.status });
  const [users, missions, submissions, assignments] = await Promise.all([
    prisma.user.findMany({ orderBy: { createdAt: "desc" }, select: { id: true, fullName: true, username: true, email: true, level: true, xp: true, isAdmin: true, createdAt: true, _count: { select: { submissions: true } } } }),
    prisma.mission.findMany({ orderBy: { createdAt: "desc" }, include: { career: { select: { name: true } }, _count: { select: { submissions: true, assignments: true } } } }),
    prisma.submission.findMany({ where: { status: { not: "DRAFT" } }, orderBy: { updatedAt: "desc" }, take: 100, include: { user: { select: { fullName: true, username: true } }, mission: { select: { title: true } } } }),
    prisma.taskAssignment.findMany({ orderBy: { createdAt: "desc" }, include: { user: { select: { fullName: true, username: true } }, mission: { select: { title: true } } } }),
  ]);
  return NextResponse.json({ admin: { fullName: admin.user.fullName }, users, missions, submissions, assignments });
}
