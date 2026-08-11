import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Award, BriefcaseBusiness, CheckCircle2, ExternalLink, Github, Linkedin, LockKeyhole, MapPin, Phone, Sparkles, Star, Trophy } from "lucide-react";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function Page({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const user = await prisma.user.findUnique({
    where: { username },
    include: {
      careers: { where: { active: true }, include: { career: true }, take: 1 },
      submissions: { where: { status: "PASSED" }, include: { mission: { include: { roadmapNode: true } } }, orderBy: { updatedAt: "desc" } },
      achievements: { include: { achievement: true }, orderBy: { unlockedAt: "desc" } },
    },
  });
  if (!user || !user.isPublic) notFound();
  const career = user.careers[0]?.career.name || "Developer";
  const verifiedSkills = [...new Set(user.submissions.map(item => item.mission.roadmapNode?.title || item.mission.title))];
  const profileSkills = user.skills ?? [];
  const initials = user.fullName.split(" ").map(part => part[0]).slice(0, 2).join("").toUpperCase();
  const projects = user.submissions.filter(item => item.liveUrl || item.githubUrl);

  return <main className="public-profile-page">
    <nav className="public-nav"><Link href="/" className="heading">✦ Skill<span>Verse</span></Link><div className="public-nav-actions"><Link href="/dashboard" className="btn btn-ghost public-back"><ArrowLeft size={16}/>Back to dashboard</Link><span className="badge"><LockKeyhole size={12}/> Verified progress</span></div></nav>
    <div className="public-profile-content">
      <section className="public-hero glass">
        <div className="public-avatar">{initials}</div>
        <div className="public-identity"><div className="eyebrow">SkillVerse professional profile</div><h1 className="heading">{user.fullName}</h1><p className="public-handle">@{user.username} · {career}</p>{user.headline&&<p className="public-headline"><BriefcaseBusiness size={16}/>{user.headline}</p>}<p className="public-bio">{user.bio || "This professional is building practical skills through real-world missions."}</p><div className="public-contact">{user.location&&<span><MapPin size={14}/>{user.location}</span>}{user.phone&&<a href={`tel:${user.phone}`}><Phone size={14}/>{user.phone}</a>}</div><div className="public-socials">{user.githubUrl && <a className="btn btn-ghost" href={user.githubUrl} target="_blank" rel="noreferrer"><Github size={17}/>GitHub</a>}{user.linkedinUrl && <a className="btn btn-ghost" href={user.linkedinUrl} target="_blank" rel="noreferrer"><Linkedin size={17}/>LinkedIn</a>}</div></div>
        <div className="public-level"><span>Current level</span><strong className="heading">{String(user.level).padStart(2, "0")}</strong><small className="mono">{user.xp.toLocaleString()} XP</small></div>
      </section>
      <div className="public-stats"><div className="card"><CheckCircle2/><strong>{user.submissions.length}</strong><span>Missions completed</span></div><div className="card"><Star/><strong>{profileSkills.length+verifiedSkills.length}</strong><span>Skills listed</span></div><div className="card"><Trophy/><strong>{user.achievements.length}</strong><span>Achievements earned</span></div></div>
      <div className="public-columns">
        <section><div className="eyebrow">Evidence of work</div><h2 className="heading">Completed missions</h2>{user.submissions.length ? user.submissions.map(item => <div className="card public-mission" key={item.id}><div><span className="badge">{item.mission.difficulty}</span><h3>{item.mission.title}</h3><p>{item.mission.description}</p></div><span className="mono">+{item.xpEarned} XP</span></div>) : <div className="card public-empty">No completed missions yet. Progress will appear here after the first successful submission.</div>}</section>
        <aside><div className="eyebrow">Professional toolkit</div><h2 className="heading">Skills</h2><div className="card profile-skills-card">{profileSkills.length?<><span className="skill-group-label"><Sparkles size={13}/>Profile skills</span><div className="skill-cloud personal-skills">{profileSkills.map(skill=><span className="badge" key={skill}>{skill}</span>)}</div></>:null}{verifiedSkills.length?<><span className="skill-group-label verified"><CheckCircle2 size={13}/>Verified by missions</span><div className="skill-cloud">{verifiedSkills.map(skill=><span className="badge" key={skill}><CheckCircle2 size={13}/>{skill}</span>)}</div></>:null}{!profileSkills.length&&!verifiedSkills.length&&<p className="muted">Skills will appear here after they are added or verified through missions.</p>}</div><div className="eyebrow profile-section-label">Achievement shelf</div><div className="achievement-mini-grid">{user.achievements.length ? user.achievements.slice(0, 6).map(item => <div className="card" key={item.id}><Award/><strong>{item.achievement.name}</strong></div>) : <div className="card public-empty">No achievements unlocked yet.</div>}</div></aside>
      </div>
      {projects.length > 0 && <section><div className="eyebrow">Live work</div><h2 className="heading">Projects</h2><div className="grid-3">{projects.map(item => <div className="card" key={item.id}><h3>{item.mission.title}</h3>{item.liveUrl && <a className="btn btn-primary" href={item.liveUrl} target="_blank" rel="noreferrer">View project <ExternalLink size={15}/></a>}</div>)}</div></section>}
    </div>
  </main>;
}
