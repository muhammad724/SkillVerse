"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { CheckCircle2, Clock, Focus, LoaderCircle, Play, Save, Send, Square, TimerReset, X } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

type Mission = { slug:string; title:string; description:string; scenario:string; difficulty:string; xpReward:number; estimatedMinutes:number; career:{name:string}; requirements:{text:string}[] };
type Attempt = { startedAt:string|null; completedAt:string|null; status:string } | null;
type Evaluation = { score:number; xpEarned:number; status:string; feedback:string; strengths:string[]; improvements:string[]; duplicate?:boolean };
const defaults = ["Solution addresses the complete scenario", "Work is clear, polished, and appropriate for the target user", "Errors and edge cases are handled", "Submission includes clear process notes and evidence"];

function formatElapsed(milliseconds: number) {
  const seconds = Math.max(0, Math.floor(milliseconds / 1000));
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return [hours, minutes, seconds % 60].map(value => String(value).padStart(2, "0")).join(":");
}

export default function Page() {
  const { id } = useParams<{id:string}>();
  const [mission, setMission] = useState<Mission|null>(null);
  const [attempt, setAttempt] = useState<Attempt>(null);
  const [now, setNow] = useState(0);
  const [starting, setStarting] = useState(false);
  const [stopping, setStopping] = useState(false);
  const [error, setError] = useState("");
  const [focus, setFocus] = useState(false);
  const [explanation, setExplanation] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [liveUrl, setLiveUrl] = useState("");
  const [criteria, setCriteria] = useState<boolean[]>(defaults.map(() => false));
  const [evaluation, setEvaluation] = useState<Evaluation|null>(null);
  const [loading, setLoading] = useState<"draft"|"submit"|null>(null);

  useEffect(() => {
    void createClient().auth.getSession().then(async ({data:{session}}) => {
      if (!session) throw new Error("Please sign in.");
      const response = await fetch(`/api/missions?slug=${encodeURIComponent(id)}`, {cache:"no-store", headers:{Authorization:`Bearer ${session.access_token}`}});
      const result = await response.json();
      if (!response.ok) throw new Error(result.message);
      setMission(result.mission);
      setAttempt(result.attempt);
      setNow(Date.now());
      setCriteria((result.mission.requirements.length ? result.mission.requirements : defaults).map(() => false));
    }).catch(e => setError(e instanceof Error ? e.message : "Could not load mission."));
  }, [id]);

  useEffect(() => {
    if (!attempt?.startedAt || attempt.completedAt) return;
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [attempt?.startedAt, attempt?.completedAt]);

  async function startMission() {
    if (!mission || starting) return;
    setStarting(true);
    try {
      const {data:{session}} = await createClient().auth.getSession();
      if (!session) throw new Error("Please log in before starting.");
      const response = await fetch("/api/missions/start", {method:"POST", headers:{"Content-Type":"application/json", Authorization:`Bearer ${session.access_token}`}, body:JSON.stringify({missionSlug:mission.slug})});
      const result = await response.json();
      if (!response.ok) throw new Error(result.message);
      setAttempt(result);
      setNow(Date.now());
      toast.success("Mission timer started. Good luck!");
    } catch (e) { toast.error(e instanceof Error ? e.message : "Could not start mission."); }
    finally { setStarting(false); }
  }

  async function stopMission() {
    if (!mission || stopping) return;
    setStopping(true);
    try {
      const {data:{session}} = await createClient().auth.getSession();
      if (!session) throw new Error("Please log in before stopping the timer.");
      const response = await fetch("/api/missions/stop", {method:"POST", headers:{"Content-Type":"application/json", Authorization:`Bearer ${session.access_token}`}, body:JSON.stringify({missionSlug:mission.slug})});
      const result = await response.json();
      if (!response.ok) throw new Error(result.message);
      setAttempt(result);
      toast.success("Mission timer stopped and saved.");
    } catch (e) { toast.error(e instanceof Error ? e.message : "Could not stop mission timer."); }
    finally { setStopping(false); }
  }

  async function send(draft:boolean) {
    if (!mission) return;
    setLoading(draft ? "draft" : "submit");
    try {
      const {data:{session}} = await createClient().auth.getSession();
      if (!session) throw new Error("Please log in before saving.");
      const response = await fetch("/api/submissions", {method:"POST", headers:{"Content-Type":"application/json", Authorization:`Bearer ${session.access_token}`}, body:JSON.stringify({missionSlug:mission.slug, explanation, githubUrl, liveUrl, criteriaCompleted:criteria.filter(Boolean).length, draft})});
      const result = await response.json();
      if (!response.ok) throw new Error(result.message);
      if (draft) toast.success("Draft saved.");
      else { setEvaluation(result); setAttempt(value => value ? {...value, completedAt:new Date().toISOString(), status:result.status} : value); toast.success(result.xpEarned ? `Mission passed: +${result.xpEarned} XP` : "Mission evaluated."); }
    } catch (e) { toast.error(e instanceof Error ? e.message : "Could not save mission."); }
    finally { setLoading(null); }
  }

  if (error) return <div className="card dashboard-state"><X/><h1 className="heading">Mission unavailable</h1><p>{error}</p><Link href="/dashboard/missions" className="btn btn-primary">Return to missions</Link></div>;
  if (!mission) return <div className="card dashboard-state"><LoaderCircle className="animate-spin"/><h2 className="heading">Loading mission brief…</h2></div>;
  const acceptance = mission.requirements.length ? mission.requirements.map(item => item.text) : defaults;
  const elapsed = attempt?.startedAt ? new Date(attempt.completedAt ?? now).getTime() - new Date(attempt.startedAt).getTime() : 0;

  return <div className={focus ? "focus-mode" : ""}>
    <div className="mission-detail-heading"><div><div className="eyebrow">{mission.career.name}</div><h1 className="heading">{mission.title}</h1></div><button className="btn btn-ghost" onClick={() => setFocus(!focus)}>{focus ? <X size={17}/> : <Focus size={17}/>} {focus ? "Exit focus" : "Focus mode"}</button></div>
    <div className="mission-meta"><span className="badge">{mission.difficulty}</span><span className="badge">{mission.xpReward} XP</span><span className="badge"><Clock size={12}/>{Math.max(1, Math.round(mission.estimatedMinutes / 60))}h estimate</span></div>
    <section className={`mission-timer ${attempt?.startedAt ? "is-running" : ""} ${attempt?.completedAt ? "is-complete" : ""}`}>
      <div className="timer-icon">{attempt?.completedAt ? <CheckCircle2/> : <TimerReset/>}</div>
      <div><span className="eyebrow">{attempt?.completedAt ? "Time recorded" : attempt?.startedAt ? "Mission in progress" : "Ready when you are"}</span><strong className="timer-value">{formatElapsed(elapsed)}</strong><p>{attempt?.completedAt ? "Your timer is stopped and the elapsed time is saved." : attempt?.startedAt ? "Your progress is saved. You can safely leave and return." : "Start the timer when you begin working on this mission."}</p></div>
      {!attempt?.startedAt && <button className="btn btn-primary" disabled={starting} onClick={startMission}>{starting ? <LoaderCircle className="animate-spin" size={17}/> : <Play size={17}/>} Start mission</button>}
      {attempt?.startedAt && !attempt.completedAt && <div className="timer-running-actions"><span className="timer-live"><i/> Live</span><button className="btn timer-stop" disabled={stopping} onClick={stopMission}>{stopping?<LoaderCircle className="animate-spin" size={16}/>:<Square size={14}/>} Stop timer</button></div>}
    </section>
    <div className="mission-detail-grid"><section className="mission-brief"><div className="card"><div className="eyebrow">Client scenario</div><h2>The situation</h2><p className="muted">{mission.scenario}</p><p>{mission.description}</p></div><div className="card"><div className="eyebrow">Completion checklist</div><h2>Acceptance criteria</h2><div className="criteria-list">{acceptance.map((item,index) => <label key={item} className={criteria[index] ? "checked" : ""}><input type="checkbox" checked={criteria[index]} onChange={e => setCriteria(values => values.map((value,i) => i === index ? e.target.checked : value))}/><span><CheckCircle2 size={17}/>{item}</span></label>)}</div></div></section>
      <section className="card submission-panel"><div><div className="eyebrow">Submit solution</div><h2>Show your work</h2><p className="muted">Share your process and project evidence for evaluation.</p></div><label>Written explanation<textarea className="field" value={explanation} onChange={e => setExplanation(e.target.value)} rows={7} placeholder="Explain your approach, decisions, testing, and tradeoffs…"/><small className={explanation.length >= 50 ? "valid-count" : "muted"}>{explanation.length}/50 minimum characters</small></label><label>Project or source URL<input className="field" value={githubUrl} onChange={e => setGithubUrl(e.target.value)} type="url" placeholder="https://github.com/you/project or Figma share link"/></label><label>Live project URL <span className="muted">(optional)</span><input className="field" value={liveUrl} onChange={e => setLiveUrl(e.target.value)} type="url" placeholder="https://project.example.com"/></label><div className="submission-actions"><button type="button" disabled={Boolean(loading)} className="btn btn-ghost" onClick={() => send(true)}>{loading === "draft" ? <LoaderCircle className="animate-spin" size={16}/> : <Save size={16}/>}Save draft</button><button type="button" disabled={Boolean(loading)} className="btn btn-primary" onClick={() => send(false)}>{loading === "submit" ? <LoaderCircle className="animate-spin" size={16}/> : <Send size={16}/>}Evaluate mission</button></div>{evaluation && <div className={`evaluation-card ${evaluation.status === "PASSED" ? "passed" : "revision"}`}><div className="evaluation-score"><span>Evaluation</span><strong className="heading">{evaluation.score}<small>/100</small></strong></div><div><span className="badge">{evaluation.status.replace("_", " ")}</span><h3>{evaluation.feedback}</h3><p>You earned {evaluation.xpEarned} XP.</p></div></div>}</section>
    </div>
  </div>;
}
