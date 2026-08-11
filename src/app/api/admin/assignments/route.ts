import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAdmin } from "@/lib/admin";

const schema = z.object({ userId: z.string().min(1), missionId: z.string().min(1), note: z.string().max(500).optional(), dueAt: z.string().optional() });
export async function POST(request: Request) {
  const admin = await getAdmin(request);
  if (!admin.ok) return NextResponse.json({ message: admin.error }, { status: admin.status });
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ message: "Choose a user and mission." }, { status: 400 });
  const assignment = await prisma.taskAssignment.upsert({
    where: { userId_missionId: { userId: parsed.data.userId, missionId: parsed.data.missionId } },
    update: { note: parsed.data.note || null, dueAt: parsed.data.dueAt ? new Date(parsed.data.dueAt) : null, completed: false, assignedById: admin.user.id },
    create: { userId: parsed.data.userId, missionId: parsed.data.missionId, assignedById: admin.user.id, note: parsed.data.note || null, dueAt: parsed.data.dueAt ? new Date(parsed.data.dueAt) : null },
  });
  return NextResponse.json({ assignment }, { status: 201 });
}
