import { NextResponse } from "next/server";
import { SubmissionStatus } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { scoreSubmission } from "@/lib/scoring";
import { getAuthenticatedUser } from "@/lib/supabase/auth-user";

const schema = z.object({
  missionSlug: z.string().min(2),
  explanation: z.string().max(5000).default(""),
  githubUrl: z.url().optional().or(z.literal("")),
  liveUrl: z.url().optional().or(z.literal("")),
  criteriaCompleted: z.number().int().min(0).max(4),
  draft: z.boolean().default(false),
});

export async function POST(request: Request) {
  const auth = await getAuthenticatedUser(request);
  if (!auth) return NextResponse.json({ message: "Please log in." }, { status: 401 });
  const input = schema.safeParse(await request.json());
  if (!input.success) return NextResponse.json({ message: "Please check your submission fields.", issues: input.error.issues }, { status: 400 });
  const user = await prisma.user.findUnique({ where: { authId: auth.id } });
  if (!user) return NextResponse.json({ message: "Complete onboarding before submitting missions." }, { status: 409 });
  const mission = await prisma.mission.findUnique({ where: { slug: input.data.missionSlug } });
  if (!mission) return NextResponse.json({ message: "Mission not found." }, { status: 404 });
  const completedBefore = await prisma.submission.findMany({ where: { userId: user.id, status: "PASSED" }, distinct: ["missionId"], select: { missionId: true } });
  const requiredCompletions = mission.difficulty === "BOSS" ? 6 : mission.difficulty === "ADVANCED" ? 2 : 0;
  if (completedBefore.length < requiredCompletions) return NextResponse.json({ message: `Complete ${requiredCompletions} missions before attempting this ${mission.difficulty.toLowerCase()} mission.` }, { status: 403 });
  const existing = await prisma.submission.findFirst({ where: { userId: user.id, missionId: mission.id }, orderBy: { updatedAt: "desc" } });
  if (input.data.draft) {
    const draft = existing && existing.status === "DRAFT"
      ? await prisma.submission.update({ where: { id: existing.id }, data: { explanation: input.data.explanation || null, githubUrl: input.data.githubUrl || null, liveUrl: input.data.liveUrl || null, criteriaCompleted: input.data.criteriaCompleted } })
      : await prisma.submission.create({ data: { userId: user.id, missionId: mission.id, explanation: input.data.explanation || null, githubUrl: input.data.githubUrl || null, liveUrl: input.data.liveUrl || null, criteriaCompleted: input.data.criteriaCompleted, startedAt: new Date() } });
    return NextResponse.json({ draft: { id: draft.id, updatedAt: draft.updatedAt } });
  }
  if (input.data.explanation.length < 50 || !input.data.githubUrl) return NextResponse.json({ message: "A 50-character explanation and a project evidence URL are required." }, { status: 400 });
  const evaluation = scoreSubmission({ explanation: input.data.explanation, githubUrl: input.data.githubUrl, liveUrl: input.data.liveUrl, criteriaCompleted: input.data.criteriaCompleted, criteriaTotal: 4, difficulty: mission.difficulty });
  const alreadyPassed = await prisma.submission.findFirst({ where: { userId: user.id, missionId: mission.id, status: "PASSED" } });
  const xpAward = alreadyPassed ? 0 : evaluation.xpEarned;
  const submission = existing && existing.status === "DRAFT"
    ? await prisma.submission.update({ where: { id: existing.id }, data: { explanation: input.data.explanation, githubUrl: input.data.githubUrl, liveUrl: input.data.liveUrl || null, criteriaCompleted: input.data.criteriaCompleted, score: evaluation.score, xpEarned: xpAward, feedback: evaluation, status: evaluation.status as SubmissionStatus, startedAt: existing.startedAt ?? new Date(), completedAt: existing.completedAt ?? new Date() } })
    : await prisma.submission.create({ data: { userId: user.id, missionId: mission.id, explanation: input.data.explanation, githubUrl: input.data.githubUrl, liveUrl: input.data.liveUrl || null, criteriaCompleted: input.data.criteriaCompleted, score: evaluation.score, xpEarned: xpAward, feedback: evaluation, status: evaluation.status as SubmissionStatus, startedAt: new Date(), completedAt: new Date() } });
  if (evaluation.status === "PASSED" && xpAward > 0) {
    const newXp = user.xp + xpAward;
    await prisma.$transaction([
      prisma.user.update({ where: { id: user.id }, data: { xp: newXp, level: Math.floor(newXp / 1000) + 1 } }),
      prisma.activity.create({ data: { userId: user.id, type: "MISSION_COMPLETED", xp: xpAward, metadata: { missionSlug: mission.slug, submissionId: submission.id } } }),
    ]);
    const completedCount = await prisma.submission.count({ where: { userId: user.id, status: "PASSED" } });
    const achievementSlug = completedCount >= 10 ? "ten-missions-completed" : completedCount >= 5 ? "five-missions-completed" : "first-mission";
    const achievement = await prisma.achievement.findUnique({ where: { slug: achievementSlug } });
    if (achievement) await prisma.userAchievement.upsert({ where: { userId_achievementId: { userId: user.id, achievementId: achievement.id } }, update: {}, create: { userId: user.id, achievementId: achievement.id } });
  }
  return NextResponse.json({ ...evaluation, xpEarned: xpAward, submissionId: submission.id, duplicate: Boolean(alreadyPassed) });
}
