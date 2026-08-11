import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/supabase/auth-user";

const schema = z.object({ missionSlug: z.string().min(2) });

export async function POST(request: Request) {
  const auth = await getAuthenticatedUser(request);
  if (!auth) return NextResponse.json({ message: "Please log in to start a mission." }, { status: 401 });
  const input = schema.safeParse(await request.json());
  if (!input.success) return NextResponse.json({ message: "A valid mission is required." }, { status: 400 });

  const user = await prisma.user.findFirst({ where: { OR: [{ authId: auth.id }, ...(auth.email ? [{ email: auth.email }] : [])] } });
  if (!user) return NextResponse.json({ message: "Complete onboarding before starting missions." }, { status: 409 });
  const mission = await prisma.mission.findFirst({ where: { slug: input.data.missionSlug, OR: [{ career: { users: { some: { userId: user.id, active: true } } } }, { assignments: { some: { userId: user.id } } }] } });
  if (!mission) return NextResponse.json({ message: "Mission not found for your career." }, { status: 404 });

  const existing = await prisma.submission.findFirst({ where: { userId: user.id, missionId: mission.id }, orderBy: { updatedAt: "desc" } });
  const submission = existing
    ? await prisma.submission.update({ where: { id: existing.id }, data: existing.startedAt ? {} : { startedAt: new Date() } })
    : await prisma.submission.create({ data: { userId: user.id, missionId: mission.id, startedAt: new Date() } });

  return NextResponse.json({ startedAt: submission.startedAt, completedAt: submission.completedAt, status: submission.status });
}
