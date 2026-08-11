"use client";

import { careers } from "@/lib/data";
import { ArrowRight, Check, Code2, Gauge, LoaderCircle, Sparkles, Target } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

const descriptions: Record<string, string> = {
  "Frontend Developer": "Interfaces, React, accessibility, and performance.",
  "Backend Developer": "APIs, databases, security, and scalable services.",
  "Full-Stack Developer": "Complete products from interface to deployment.",
  "QA Automation Engineer": "Testing strategy, browser automation, and quality.",
  "UI/UX Developer": "Design systems, interaction, and accessible interfaces.",
  "Figma Designer": "Prototypes, component libraries, auto layout, and product design.",
  "Web Designer": "Responsive websites, visual systems, typography, and conversion.",
};
const goalOptions = ["Land my first role", "Switch to a new career", "Build a professional portfolio", "Start freelancing", "Improve skills for my current job"];

export default function Page() {
  const router = useRouter();
  const [career, setCareer] = useState(careers[2]);
  const [goalChoice, setGoalChoice] = useState(goalOptions[0]);
  const [customGoal, setCustomGoal] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setLoading(true);
    const form = new FormData(event.currentTarget);
    try {
      const { data: { session } } = await createClient().auth.getSession();
      if (!session) { toast.error("Please log in or confirm your email before continuing."); router.push("/login"); return; }
      const goal = goalChoice === "CUSTOM" ? customGoal.trim() : goalChoice;
      const response = await fetch("/api/onboarding", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` }, body: JSON.stringify({ career, experience: form.get("experience"), goal, weeklyHours: Number(form.get("weeklyHours")) }) });
      const contentType = response.headers.get("content-type") ?? "";
      const result = contentType.includes("application/json") ? await response.json() : null;
      if (!response.ok) throw new Error(result?.message || "Could not save onboarding.");
      toast.success("Your personal roadmap is ready."); router.push("/dashboard"); router.refresh();
    } catch (error) { toast.error(error instanceof Error ? error.message : "Could not save onboarding."); }
    finally { setLoading(false); }
  }

  return <main className="onboarding-page">
    <div className="onboarding-aurora"/>
    <nav className="onboarding-nav"><span className="heading">✦ Skill<span>Verse</span></span><div><span>01</span><i/><span>02</span></div></nav>
    <div className="onboarding-content">
      <header className="onboarding-intro"><div className="eyebrow"><Sparkles size={14}/> Personalized campaign setup</div><h1 className="heading">Where do you want your skills to take you?</h1><p>Choose a path and tell us how you learn. SkillVerse will shape your first missions around your goal.</p></header>
      <form onSubmit={submit}>
        <section><div className="section-heading"><div><span>Step 01</span><h2 className="heading">Select your career path</h2></div><Code2/></div><div className="career-choice-grid">{careers.map(item => <button type="button" key={item} onClick={() => setCareer(item)} className={`career-choice ${career === item ? "selected" : ""}`}><span className="choice-icon"><Code2 size={20}/></span><div><strong>{item}</strong><p>{descriptions[item]}</p><small>4 role-specific missions · dedicated roadmap</small></div>{career === item && <span className="choice-check"><Check size={14}/></span>}</button>)}</div></section>
        <section className="calibration-card"><div className="section-heading"><div><span>Step 02</span><h2 className="heading">Calibrate your schedule</h2></div><Gauge/></div><div className="grid-3"><label>Experience level<select className="field" name="experience" defaultValue="BEGINNER"><option value="BEGINNER">Beginner</option><option value="INTERMEDIATE">Intermediate</option><option value="ADVANCED">Advanced</option></select></label><label>Main career goal<select className="field" value={goalChoice} onChange={event=>setGoalChoice(event.target.value)}>{goalOptions.map(goal=><option value={goal} key={goal}>{goal}</option>)}<option value="CUSTOM">Write my own goal…</option></select></label><label>Weekly learning hours<input className="field" name="weeklyHours" type="number" min="1" max="60" defaultValue="8" required/></label></div>{goalChoice==="CUSTOM"&&<label className="custom-goal-field">Your personal goal<textarea className="field" value={customGoal} onChange={event=>setCustomGoal(event.target.value)} required minLength={4} maxLength={160} rows={3} placeholder="Describe what you want SkillVerse to help you achieve…"/></label>}<div className="onboarding-summary"><Target size={20}/><div><strong>Your campaign preview</strong><p>{career} · {goalChoice==="CUSTOM"?(customGoal||"Your custom goal"):goalChoice} · approximately 8 hours/week</p></div></div></section>
        <button disabled={loading} className="btn btn-primary onboarding-submit">{loading ? <LoaderCircle className="animate-spin" size={18}/> : <Sparkles size={18}/>} {loading ? "Building your roadmap…" : "Initialize my roadmap"}<ArrowRight size={18}/></button>
      </form>
    </div>
  </main>;
}
