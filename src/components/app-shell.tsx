"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Award, Bot, ChevronRight, ClipboardList, Command, Gamepad2, LayoutDashboard, LogOut, Map, Menu, Settings, Target, Terminal as TerminalIcon, User, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

const nav = [
  ["/dashboard", "Overview", LayoutDashboard],
  ["/dashboard/roadmap", "Roadmap", Map],
  ["/dashboard/missions", "Missions", Target],
  ["/dashboard/tasks", "Assigned Tasks", ClipboardList],
  ["/dashboard/games/css-grid", "CSS Grid Game", Gamepad2],
  ["/dashboard/ai-mentor", "AI Mentor", Bot],
  ["/dashboard/achievements", "Achievements", Award],
  ["/dashboard/settings", "Settings", Settings],
] as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const router = useRouter();
  const [terminal, setTerminal] = useState(false);
  const [palette, setPalette] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [username, setUsername] = useState("");
  const [careerName, setCareerName] = useState("Choose your career path");

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === "`") { event.preventDefault(); setTerminal(value => !value); }
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") { event.preventDefault(); setPalette(value => !value); }
      if (event.key === "Escape") { setTerminal(false); setPalette(false); setMobile(false); }
    };
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    void createClient().auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.replace("/login"); return null; }
      return fetch("/api/profile", { cache: "no-store", headers: { Authorization: `Bearer ${session.access_token}` } });
    }).then(response => response?.ok ? response.json() : null).then(data => {
      if (data && !data.profile) { router.replace("/onboarding"); return; }
      setUsername(data?.profile?.username || data?.auth?.username || "");
      setCareerName(data?.profile?.careers?.[0]?.career?.name || "Choose your career path");
    }).catch(() => undefined);
  }, [router]);

  const go = (href: string) => { router.push(href); setPalette(false); setMobile(false); };
  const logout = async () => {
    try { await createClient().auth.signOut(); } catch { /* no active session */ }
    toast.success("You have been logged out safely.");
    router.push("/login");
    router.refresh();
  };

  return <div className="app-shell">
    {mobile && <button className="sidebar-backdrop" aria-label="Close navigation" onClick={() => setMobile(false)}/>} 
    <aside className={`app-sidebar glass ${mobile ? "is-open" : ""}`}>
      <div className="sidebar-brand"><span className="brand-mark">✦</span><span className="heading">Skill<span>Verse</span></span><button className="sidebar-close" aria-label="Close navigation" onClick={() => setMobile(false)}><X size={18}/></button></div>
      <div className="sidebar-label">Mission control</div>
      <nav className="sidebar-nav" aria-label="Dashboard navigation">
        {nav.map(([href, label, Icon]) => {
          const active = href === "/dashboard" ? path === href : path.startsWith(href);
          return <Link key={href} href={href} onClick={() => setMobile(false)} className={`sidebar-link ${active ? "active" : ""}`}><Icon size={18}/><span>{label}</span>{active && <ChevronRight className="nav-arrow" size={15}/>}</Link>;
        })}
      </nav>
      <div className="sidebar-bottom">
        <button className="sidebar-action" onClick={() => setTerminal(true)}><TerminalIcon size={18}/><span>Open terminal</span><kbd>⌃`</kbd></button>
        <button className="sidebar-action logout" onClick={logout}><LogOut size={18}/><span>Log out</span></button>
      </div>
    </aside>

    <header className="app-header glass">
      <button className="mobile-menu-button" aria-label="Open navigation" onClick={() => setMobile(true)}><Menu size={20}/></button>
      <div className="header-career"><span>Current career</span><strong className="heading">{careerName}</strong></div>
      <div className="header-actions">
        <button className="header-button command-button" onClick={() => setPalette(true)}><Command size={17}/><span>Quick actions</span><kbd>⌘K</kbd></button>
        <Link href={username ? `/u/${username}` : "/onboarding"} className="header-button profile-button" aria-label="Open public profile"><User size={18}/></Link>
      </div>
    </header>

    <main className="app-main"><div className="app-content">{children}</div></main>
    {terminal && <Terminal onClose={() => setTerminal(false)} go={go} username={username}/>} 
    {palette && <CommandPalette go={go} close={() => setPalette(false)} openTerminal={() => { setPalette(false); setTerminal(true); }} logout={logout}/>} 
  </div>;
}

function CommandPalette({ go, close, openTerminal, logout }: { go: (href: string) => void; close: () => void; openTerminal: () => void; logout: () => void }) {
  return <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="Command palette" onClick={close}>
    <div className="command-palette glass" onClick={event => event.stopPropagation()}>
      <div className="palette-heading"><Command size={19}/><span>Jump to an action…</span><button aria-label="Close command palette" onClick={close}><X size={16}/></button></div>
      {nav.slice(0, 4).map(([href, label, Icon]) => <button key={href} onClick={() => go(href)}><Icon size={18}/><span>Open {label}</span><ChevronRight size={15}/></button>)}
      <button onClick={openTerminal}><TerminalIcon size={18}/><span>Open Terminal</span><ChevronRight size={15}/></button>
      <button className="palette-logout" onClick={logout}><LogOut size={18}/><span>Log Out</span></button>
    </div>
  </div>;
}

function Terminal({ onClose, go, username }: { onClose: () => void; go: (href: string) => void; username: string }) {
  const [lines, setLines] = useState<string[]>(["SkillVerse CLI v1.0 — type 'help' to explore."]);
  const [value, setValue] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const input = useRef<HTMLInputElement>(null);
  const commands = ["help", "dashboard", "roadmap", "missions", "mission next", "stats", "skills", "achievements", "portfolio", "profile", "about", "clear", "theme", "coffee", "sudo hire me"];
  useEffect(() => input.current?.focus(), []);
  const run = (raw: string) => {
    const cmd = raw.trim().toLowerCase(); if (!cmd) return;
    if (cmd === "clear") { setLines([]); setValue(""); return; }
    setHistory(items => [...items, cmd]);
    const profilePath = username ? `/u/${username}` : "/onboarding";
    const routes: Record<string, string> = { dashboard: "/dashboard", roadmap: "/dashboard/roadmap", missions: "/dashboard/missions", achievements: "/dashboard/achievements", portfolio: profilePath, profile: profilePath };
    if (routes[cmd]) { go(routes[cmd]); onClose(); return; }
    const output: Record<string, string> = { help: `COMMANDS: ${commands.join(" · ")}`, stats: "LEVEL: 1 | XP: 0 | MISSIONS: 0 | STREAK: 0 days", skills: "Complete your first mission to verify a skill.", "mission next": "NEXT: Build a responsive landing page · 100 XP · Beginner", about: "SkillVerse turns career growth into focused, real-world missions.", coffee: "Brewing focus… ☕ Ready.", theme: "Aurora Dark is active.", "sudo hire me": "Permission granted. Loading your dream career... ✦" };
    setLines(items => [...items, `skillverse@career:~$ ${cmd}`, output[cmd] || `Command not found: ${cmd}`]); setValue("");
  };
  return <div className="terminal-window glass"><div className="terminal-header"><span className="mono"><TerminalIcon size={16}/>SKILLVERSE TERMINAL</span><button aria-label="Close terminal" onClick={onClose}><X size={16}/></button></div><div className="terminal-output mono">{lines.map((line, index) => <div key={index}>{line}</div>)}</div><form onSubmit={event => { event.preventDefault(); run(value); }} className="terminal-prompt"><span className="mono">skillverse@career:~$</span><input ref={input} value={value} onChange={event => setValue(event.target.value)} onKeyDown={event => { if (event.key === "Tab") { event.preventDefault(); const found = commands.find(command => command.startsWith(value)); if (found) setValue(found); } if (event.key === "ArrowUp") { event.preventDefault(); setValue(history.at(-1) || ""); } }} aria-label="Terminal command" className="mono"/></form></div>;
}
