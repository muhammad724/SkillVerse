"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, LoaderCircle, LockKeyhole, Mail, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function AdminLogin() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setLoading(true); setError("");
    const form = new FormData(event.currentTarget);
    const supabase = createClient();
    const { data, error: authError } = await supabase.auth.signInWithPassword({ email: String(form.get("email")), password: String(form.get("password")) });
    if (authError || !data.session) { setError(authError?.message || "Sign in failed."); setLoading(false); return; }
    const response = await fetch("/api/admin/overview", { headers: { Authorization: `Bearer ${data.session.access_token}` } });
    if (!response.ok) { await supabase.auth.signOut(); setError(response.status === 403 ? "This account does not have administrator access." : "Admin access could not be verified."); setLoading(false); return; }
    router.replace("/admin"); router.refresh();
  }
  return <main className="admin-login-page"><section className="admin-login-card glass"><div className="admin-login-icon"><LockKeyhole/></div><div><div className="eyebrow">Restricted workspace</div><h1 className="heading">Admin control room</h1><p>Sign in with an approved SkillVerse administrator account.</p></div>{error && <div className="auth-notice error" role="alert"><ShieldCheck size={18}/>{error}</div>}<form onSubmit={submit}><label>Email<div className="auth-input"><Mail size={17}/><input className="field" name="email" type="email" required autoComplete="email" placeholder="admin@skillverse.dev"/></div></label><label>Password<div className="auth-input"><KeyRound size={17}/><input className="field" name="password" type="password" required autoComplete="current-password"/></div></label><button className="btn btn-primary" disabled={loading}>{loading && <LoaderCircle className="animate-spin" size={17}/>}Enter control room</button></form><Link href="/login" className="muted">← Return to member login</Link></section></main>;
}
