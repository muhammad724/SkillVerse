"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";
import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { Sentry.captureException(error); console.error("SkillVerse route error", error); }, [error]);
  return <main className="system-state-page"><div className="system-state-card glass"><span className="system-state-icon error"><AlertTriangle/></span><div className="eyebrow">Mission control interruption</div><h1 className="heading">Something went wrong.</h1><p>Your account data is safe. Retry the current operation or return to the dashboard.</p><button className="btn btn-primary" onClick={reset}><RefreshCw size={17}/>Try again</button>{error.digest && <small className="mono muted">REFERENCE: {error.digest}</small>}</div></main>;
}
