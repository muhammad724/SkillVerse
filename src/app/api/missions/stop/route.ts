import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/supabase/auth-user";

const schema = z.object({ missionSlug: z.string().min(2) });

export async function POST(request: Request) {
  const auth = await getAuthenticatedUser(request);
  if (!auth) return NextResponse.json({ message: "Please log in to stop the timer." }, { status: 401 });
  const input = schema.safeParse(await request.json());
  if (!input.success) return NextResponse.json({ message: "A valid mission is required." }, { status: 400 });
  const user = await prisma.user.findFirst({ where: { OR: [{ authId: auth.id }, ...(auth.email ? [{ email: auth.email }] : [])] } });
  if (!user) return NextResponse.json({ message: "Profile not found." }, { status: 404 });
  const attempt = await prisma.submission.findFirst({ where: { userId: user.id, mission: { slug: input.data.missionSlug } }, orderBy: { updatedAt: "desc" } });
  if (!attempt?.startedAt) return NextResponse.json({ message: "Start the mission before stopping its timer." }, { status: 409 });
  const submission = attempt.completedAt ? attempt : await prisma.submission.update({ where: { id: attempt.id }, data: { completedAt: new Date() } });
  return NextResponse.json({ startedAt: submission.startedAt, completedAt: submission.completedAt, status: submission.status });
}
