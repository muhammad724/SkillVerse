"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  LoaderCircle,
  Mail,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

type Notice = { tone: "error" | "success"; message: string } | null;

function friendlyAuthError(message: string) {
  const value = message.replaceAll("_", " ").replaceAll("+", " ");
  if (/rate limit|too many requests|email rate/i.test(value)) {
    return "Too many emails were requested recently. Please wait a few minutes before trying again, or use the newest confirmation email already in your inbox.";
  }
  if (/expired|invalid.*(link|token)|otp/i.test(value)) {
    return "That confirmation link is invalid or has expired. Enter your email below to request a fresh one.";
  }
  if (/email not confirmed/i.test(value)) {
    return "Your email is not confirmed yet. Check your inbox or request a new confirmation link.";
  }
  if (/invalid login credentials/i.test(value)) {
    return "The email or password is incorrect. Please check both and try again.";
  }
  return value || "Authentication failed. Please try again.";
}

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const register = mode === "register";
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [notice, setNotice] = useState<Notice>(null);

  useEffect(() => {
    void createClient().auth.getSession().then(({ data: { session } }) => {
      if (session) router.replace("/dashboard");
    });

    const params = new URLSearchParams(window.location.search);
    const error = params.get("error");
    if (error) {
      queueMicrotask(() => setNotice({ tone: "error", message: friendlyAuthError(error) }));
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, [router]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = window.setInterval(() => {
      setResendCooldown(value => value <= 1 ? 0 : value - 1);
    }, 1000);
    return () => window.clearInterval(timer);
  }, [resendCooldown]);

  async function resend(form: HTMLFormElement | null) {
    const email = form ? String(new FormData(form).get("email") ?? "").trim() : "";
    if (!email) {
      setNotice({ tone: "error", message: "Enter your email address first." });
      return;
    }

    setNotice(null);
    setResending(true);
    const { error } = await createClient().auth.resend({
      type: "signup",
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=/onboarding` },
    });
    setResending(false);
    if (!error) setResendCooldown(60);
    setNotice(error
      ? { tone: "error", message: friendlyAuthError(error.message) }
      : { tone: "success", message: "A fresh confirmation link is on its way. Check your inbox and spam folder." });
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice(null);
    setLoading(true);

    try {
      const form = new FormData(event.currentTarget);
      const email = String(form.get("email") ?? "").trim();
      const password = String(form.get("password") ?? "");
      const supabase = createClient();

      if (register) {
        const confirm = String(form.get("confirm") ?? "");
        if (password !== confirm) throw new Error("Passwords do not match.");

        const fullName = String(form.get("name") ?? "").trim();
        const username = String(form.get("username") ?? "").trim().toLowerCase();
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback?next=/onboarding`,
            data: { full_name: fullName, username },
          },
        });
        if (error) throw error;
        if (data.session) {
          toast.success("Account created. Let’s personalize your roadmap.");
          router.push("/onboarding");
        } else {
          router.push(`/login?email=${encodeURIComponent(email)}&confirmed=pending`);
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back, Pathfinder!");
        router.push("/dashboard");
      }
      router.refresh();
    } catch (error) {
      setNotice({
        tone: "error",
        message: friendlyAuthError(error instanceof Error ? error.message : "Authentication failed."),
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-orb auth-orb-one" />
      <div className="auth-orb auth-orb-two" />
      <section className="auth-shell">
        <aside className="auth-story">
          <Link href="/" className="auth-brand heading" aria-label="SkillVerse home">
            <span className="brand-mark"><Sparkles size={17} /></span>
            Skill<span>Verse</span>
          </Link>
          <div className="auth-story-copy">
            <div className="eyebrow">Your developer campaign</div>
            <h2 className="heading">Turn learning into visible proof.</h2>
            <p>Follow a focused roadmap, complete real missions, and build a profile that shows what you can actually do.</p>
            <ul>
              <li><CheckCircle2 size={17} /> Personalized skill roadmap</li>
              <li><CheckCircle2 size={17} /> Practical portfolio missions</li>
              <li><CheckCircle2 size={17} /> Shareable progress profile</li>
            </ul>
          </div>
          <div className="auth-trust"><ShieldCheck size={18} /><span><strong>Private by default</strong><small>Your password is handled securely by Supabase.</small></span></div>
        </aside>

        <div className="auth-form-side">
          <Link href="/" className="auth-mobile-brand heading"><Sparkles size={18} /> Skill<span>Verse</span></Link>
          <form onSubmit={submit} className="auth-form" noValidate={false}>
            <div className="auth-heading">
              <div className="eyebrow">{register ? "Start your campaign" : "Welcome back"}</div>
              <h1 className="heading">{register ? "Create your account" : "Continue your journey"}</h1>
              <p>{register ? "Create your profile and get a roadmap built around your goal." : "Sign in to pick up exactly where you left off."}</p>
            </div>

            {notice && <div className={`auth-notice ${notice.tone}`} role="status" aria-live="polite">
              {notice.tone === "success" ? <CheckCircle2 size={18} /> : <ShieldCheck size={18} />}
              <span>{notice.message}</span>
            </div>}

            {register && <div className="auth-row">
              <label>Full name<div className="auth-input"><UserRound size={17} /><input className="field" name="name" required minLength={2} autoComplete="name" placeholder="Muhammad Ali" /></div></label>
              <label>Username<div className="auth-input"><span className="auth-at">@</span><input className="field" name="username" required minLength={3} pattern="[a-zA-Z0-9_]+" autoComplete="username" placeholder="muhammad" /></div></label>
            </div>}

            <label>Email address<div className="auth-input"><Mail size={17} /><input className="field" type="email" name="email" required autoComplete="email" placeholder="you@example.com" /></div></label>
            <label>Password<div className="auth-input"><KeyRound size={17} /><input className="field" type={show ? "text" : "password"} name="password" required minLength={8} autoComplete={register ? "new-password" : "current-password"} placeholder="At least 8 characters" /><button type="button" className="auth-eye" onClick={() => setShow(value => !value)} aria-label={show ? "Hide password" : "Show password"}>{show ? <EyeOff size={18} /> : <Eye size={18} />}</button></div></label>
            {register && <label>Confirm password<div className="auth-input"><KeyRound size={17} /><input className="field" type={show ? "text" : "password"} name="confirm" required minLength={8} autoComplete="new-password" placeholder="Repeat your password" /></div></label>}

            <button disabled={loading || resending} className="btn btn-primary auth-submit">
              {loading ? <LoaderCircle className="animate-spin" size={18} /> : null}
              <span>{loading ? "Connecting securely…" : register ? "Create my account" : "Sign in to SkillVerse"}</span>
              {!loading && <ArrowRight size={18} />}
            </button>

            {!register && <button type="button" disabled={loading || resending || resendCooldown > 0} className="auth-resend" onClick={event => void resend(event.currentTarget.form)}>
              {resending && <LoaderCircle className="animate-spin" size={15} />}
              {resending ? "Sending a new link…" : resendCooldown > 0 ? `You can resend again in ${resendCooldown}s` : "Didn’t receive your confirmation email? Resend it"}
            </button>}

            <p className="auth-switch">{register ? "Already have an account?" : "New to SkillVerse?"} <Link href={register ? "/login" : "/register"}>{register ? "Sign in" : "Create an account"}</Link></p>
          </form>
        </div>
      </section>
    </main>
  );
}
