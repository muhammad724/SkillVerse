import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/supabase/auth-user";

export async function GET(request: Request) {
  const auth = await getAuthenticatedUser(request);
  if (!auth) return NextResponse.json({ message: "Please log in." }, { status: 401 });
  const user = await prisma.user.findUnique({
    where: { authId: auth.id },
    include: {
      careers: { where: { active: true }, include: { career: { include: { nodes: { orderBy: { position: "asc" } } } } }, take: 1 },
      submissions: { where: { status: "PASSED" }, include: { mission: true }, orderBy: { updatedAt: "desc" } },
      achievements: { include: { achievement: true }, orderBy: { unlockedAt: "desc" } },
      activities: { orderBy: { createdAt: "desc" }, take: 30 },
    },
  });
  if (!user) return NextResponse.json({ needsOnboarding: true }, { status: 404 });
  const completedSlugs = [...new Set(user.submissions.map(item => item.mission.slug))];
  const career = user.careers[0]?.career;
  const nextMission = career ? await prisma.mission.findFirst({ where: { careerId: career.id, slug: { notIn: completedSlugs } }, orderBy: [{ boss: "asc" }, { xpReward: "asc" }, { createdAt: "desc" }] }) : null;
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(); date.setHours(0, 0, 0, 0); date.setDate(date.getDate() - (6 - index));
    const next = new Date(date); next.setDate(next.getDate() + 1);
    return { day: date.toLocaleDateString("en", { weekday: "short" }), xp: user.activities.filter(item => item.createdAt >= date && item.createdAt < next).reduce((sum, item) => sum + item.xp, 0) };
  });
  return NextResponse.json({
    user: { fullName: user.fullName, username: user.username, xp: user.xp, level: user.level, streak: user.streak },
    career: career ? { name: career.name, totalNodes: career.nodes.length, nodes: career.nodes.map(node => ({ id: node.id, title: node.title, description: node.description, position: node.position, xpReward: node.xpReward })) } : null,
    completedMissions: completedSlugs,
    completedCount: completedSlugs.length,
    nextMission,
    achievements: user.achievements.map(item => item.achievement),
    weeklyActivity: days,
  });
}
