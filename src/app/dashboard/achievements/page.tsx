"use client";

import { achievements } from "@/lib/data";
import { createClient } from "@/lib/supabase/client";
import { Award, Lock } from "lucide-react";
import { useEffect, useState } from "react";

export default function Page() {
  const [unlocked, setUnlocked] = useState<string[]>([]);
  useEffect(() => { void createClient().auth.getSession().then(async ({ data: { session } }) => { if (!session) return; const response = await fetch("/api/dashboard", { cache: "no-store", headers: { Authorization: `Bearer ${session.access_token}` } }); if (response.ok) setUnlocked((await response.json()).achievements.map((item: { name: string }) => item.name)); }); }, []);
  return <><div className="eyebrow">Achievement vault · {unlocked.length}/{achievements.length} unlocked</div><h1 className="heading" style={{ fontSize: 42, marginBottom: 8 }}>Proof worth collecting.</h1><p className="muted">Every unlocked card comes from your real SkillVerse activity.</p><div className="grid-3" style={{ marginTop: 30 }}>{achievements.map(name => { const earned = unlocked.includes(name); return <div className={`card achievement-card ${earned ? "earned" : "locked"}`} key={name}><div className="achievement-icon">{earned ? <Award size={31}/> : <Lock size={24}/>}</div><span className="badge">{earned ? "Unlocked" : "Locked"}</span><h3 className="heading">{name}</h3><p>{earned ? "Verified on your public developer profile." : "Keep completing relevant missions to unlock this collectible."}</p></div>; })}</div></>;
}
