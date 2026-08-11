"use client";
import * as Sentry from "@sentry/nextjs";import{useEffect}from"react";
export default function GlobalError({error}:{error:Error&{digest?:string}}){useEffect(()=>{Sentry.captureException(error)},[error]);return <html><body><main className="system-state-page"><div className="system-state-card"><h1>SkillVerse encountered an error.</h1><p>The issue has been reported. Please reload the application.</p></div></main></body></html>}
