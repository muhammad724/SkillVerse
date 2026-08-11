import { NextResponse } from "next/server";
import { ExperienceLevel } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/supabase/auth-user";

const schema = z.object({
  career: z.string().min(2),
  experience: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]),
  goal: z.string().min(4).max(160),
  weeklyHours: z.number().int().min(1).max(60),
});

export async function POST(request: Request) {
  try {
  const auth = await getAuthenticatedUser(request);
  if (!auth?.email) return NextResponse.json({ message: "Please log in before onboarding." }, { status: 401 });
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ message: "Please complete every onboarding field." }, { status: 400 });
  const career = await prisma.career.findFirst({ where: { name: parsed.data.career } });
  if (!career) return NextResponse.json({ message: "That career path is unavailable." }, { status: 404 });
  const metadata = auth.user_metadata;
  const baseUsername = String(metadata.username || auth.email.split("@")[0]).toLowerCase().replace(/[^a-z0-9_]/g, "_");
  let profile = await prisma.user.findUnique({ where: { authId: auth.id } });
  if (!profile) {
    const existing = await prisma.user.findUnique({ where: { username: baseUsername } });
    const username = existing ? `${baseUsername}_${auth.id.slice(0, 5)}` : baseUsername;
    profile = await prisma.user.create({ data: { authId: auth.id, email: auth.email, username, fullName: String(metadata.full_name || username) } });
  }
  await prisma.$transaction([
    prisma.userCareer.updateMany({ where: { userId: profile.id, active: true }, data: { active: false } }),
    prisma.userCareer.upsert({
      where: { userId_careerId: { userId: profile.id, careerId: career.id } },
      update: { active: true, experience: parsed.data.experience as ExperienceLevel, goal: parsed.data.goal, weeklyHours: parsed.data.weeklyHours },
      create: { userId: profile.id, careerId: career.id, experience: parsed.data.experience as ExperienceLevel, goal: parsed.data.goal, weeklyHours: parsed.data.weeklyHours },
    }),
  ]);
  return NextResponse.json({ username: profile.username });
  } catch (error) {
    console.error("Onboarding failed", error);
    return NextResponse.json(
      { message: "We could not save your roadmap. Please try again in a moment." },
      { status: 500 },
    );
  }
}
