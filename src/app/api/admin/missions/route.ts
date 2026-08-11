import { NextResponse } from "next/server";
import { Difficulty } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAdmin } from "@/lib/admin";

const missionSchema = z.object({
  careerId: z.string().min(1), title: z.string().min(4).max(100), description: z.string().min(12).max(500),
  scenario: z.string().min(12).max(1000), difficulty: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED", "BOSS"]),
  xpReward: z.number().int().min(25).max(5000), estimatedMinutes: z.number().int().min(15).max(10000),
});

export async function GET(request: Request) {
  const admin = await getAdmin(request);
  if (!admin.ok) return NextResponse.json({ message: admin.error }, { status: admin.status });
  return NextResponse.json({ careers: await prisma.career.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }) });
}

export async function POST(request: Request) {
  const admin = await getAdmin(request);
  if (!admin.ok) return NextResponse.json({ message: admin.error }, { status: admin.status });
  const parsed = missionSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ message: "Check every mission field.", issues: parsed.error.issues }, { status: 400 });
  const slugBase = parsed.data.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const exists = await prisma.mission.findUnique({ where: { slug: slugBase } });
  const mission = await prisma.mission.create({ data: { ...parsed.data, difficulty: parsed.data.difficulty as Difficulty, slug: exists ? `${slugBase}-${Date.now().toString(36)}` : slugBase, boss: parsed.data.difficulty === "BOSS" } });
  return NextResponse.json({ mission }, { status: 201 });
}
