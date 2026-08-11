"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Award, Flame, LoaderCircle, Target, Trophy, Zap } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

type DashboardData = {
  user: { fullName: string; username: string; xp: number; level: number; streak: number };
  career: { name: string; totalNodes: number } | null;
  completedCount: number;
  nextMission: { slug: string; title: string; description: string; difficulty: string; xpReward: number } | null;
  achievements: { id: string; name: string; description: string }[];
  weeklyActivity: { day: string; xp: number }[];
};

export default function Dashboard() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState("");
  useEffect(() => { void (async () => {
    try {
      const { data: { session } } = await createClient().auth.getSession();
      if (!session) throw new Error("Please log in to view your dashboard.");
      const response = await fetch("/api/dashboard", { cache: "no-store", headers: { Authorization: `Bearer ${session.access_token}` } });
      const result = await response.json();
      if (result.needsOnboarding) { router.replace("/onboarding"); return; }
      if (!response.ok) throw new Error(result.message);
      setData(result);
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Could not load your dashboard."); }
  })(); }, [router]);

  if (error) return <div className="card dashboard-state"><Target/><h1 className="heading">Dashboard unavailable</h1><p>{error}</p><Link href="/login" className="btn btn-primary">Return to login</Link></div>;
  if (!data) return <div className="card dashboard-state"><LoaderCircle className="animate-spin"/><h2 className="heading">Loading your campaign…</h2><p>Syncing missions, XP, and achievements.</p></div>;
  const firstName = data.user.fullName.split(" ")[0];
  const levelProgress = data.user.xp % 1000;
  const careerProgress = Math.min(100, Math.round((data.completedCount / Math.max(data.career?.totalNodes || 12, 1)) * 100));
  const newestAchievement = data.achievements[0];

  return <>
    <div className="eyebrow">Live career campaign</div><h1 className="heading" style={{ fontSize: 42, margin: "8px 0" }}>Welcome back, {firstName}.</h1><p className="muted">Your progress below comes directly from completed SkillVerse missions.</p>
    <div className="grid-3" style={{ marginTop: 28 }}>{[[Zap, "Level", String(data.user.level).padStart(2, "0")], [Trophy, "Total XP", data.user.xp.toLocaleString()], [Flame, "Current streak", `${data.user.streak} days`]].map(([Icon, label, value]) => <div className="card stat-card" key={String(label)}><Icon color="#a78bfa"/><div><p className="muted">{String(label)}</p><strong className="heading">{String(value)}</strong></div></div>)}</div>
    <div className="grid-2" style={{ marginTop: 20 }}>
      <div className="card active-mission-card"><div className="eyebrow">Recommended next mission</div>{data.nextMission ? <><h2 className="heading">{data.nextMission.title}</h2><p className="muted">{data.nextMission.description}</p><div className="mission-meta"><span className="badge">{data.nextMission.difficulty}</span><span className="badge">{data.nextMission.xpReward} XP</span></div><Link href={`/dashboard/missions/${data.nextMission.slug}`} className="btn btn-primary">Start mission</Link></> : <><h2 className="heading">Campaign complete</h2><p className="muted">You completed every available mission in this career.</p></>}</div>
      <div className="card"><div className="chart-card-heading"><div><div className="eyebrow">Weekly activity</div><h2>{data.weeklyActivity.reduce((sum, item) => sum + item.xp, 0)} XP earned</h2></div><Target color="#22d3ee"/></div><div style={{ height: 220 }}><ResponsiveContainer width="100%" height="100%"><AreaChart data={data.weeklyActivity}><defs><linearGradient id="xp" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#7c3aed" stopOpacity={.7}/><stop offset="1" stopColor="#7c3aed" stopOpacity={0}/></linearGradient></defs><XAxis dataKey="day" axisLine={false} tickLine={false}/><Tooltip contentStyle={{ background: "#18181b", border: "1px solid #333", borderRadius: 12 }}/><Area dataKey="xp" stroke="#a78bfa" fill="url(#xp)" strokeWidth={3}/></AreaChart></ResponsiveContainer></div></div>
    </div>
    <div className="grid-2" style={{ marginTop: 20 }}>
      <div className="card"><div className="eyebrow">Career progress</div><h2 className="heading">{data.career?.name || "Choose a career"}</h2><div className="progress"><span style={{ width: `${careerProgress}%` }}/></div><div className="progress-details"><span>{data.completedCount} missions completed</span><span>{careerProgress}%</span></div><div className="progress" style={{ marginTop: 18 }}><span style={{ width: `${levelProgress / 10}%` }}/></div><p className="muted mono">{levelProgress} / 1,000 XP TO LEVEL {data.user.level + 1}</p><Link href="/dashboard/roadmap" className="btn btn-ghost">Explore roadmap</Link></div>
      <div className="card"><Award color={newestAchievement ? "#f59e0b" : "#71717a"}/><div className="eyebrow" style={{ marginTop: 16 }}>{newestAchievement ? "Newest achievement" : "Next achievement"}</div><h2 className="heading">{newestAchievement?.name || "First Mission"}</h2><p className="muted">{newestAchievement?.description || "Complete one mission to unlock your first collectible achievement."}</p></div>
    </div>
  </>;
}
