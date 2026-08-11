import { NextResponse } from "next/server";
import { SubmissionStatus } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAdmin } from "@/lib/admin";

const schema = z.object({ status: z.enum(["PASSED", "NEEDS_REVISION"]), score: z.number().int().min(0).max(100), feedback: z.string().min(4).max(1200) });
export async function PATCH(request: Request, context: RouteContext<"/api/admin/submissions/[id]">) {
  const admin = await getAdmin(request);
  if (!admin.ok) return NextResponse.json({ message: admin.error }, { status: admin.status });
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ message: "Add a score and useful feedback." }, { status: 400 });
  const { id } = await context.params;
  const submission = await prisma.submission.update({ where: { id }, data: { status: parsed.data.status as SubmissionStatus, score: parsed.data.score, feedback: { adminFeedback: parsed.data.feedback, reviewedBy: admin.user.fullName } } });
  return NextResponse.json({ submission });
}
