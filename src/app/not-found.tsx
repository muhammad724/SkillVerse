import Link from "next/link";
import { ArrowLeft, MapPinOff } from "lucide-react";

export default function NotFound() {
  return <main className="system-state-page"><div className="system-state-card glass"><span className="system-state-icon"><MapPinOff/></span><div className="eyebrow">Error 404 · Route unavailable</div><h1 className="heading">This mission coordinate does not exist.</h1><p>The page may have moved, the profile may be private, or the URL may be incorrect.</p><Link href="/" className="btn btn-primary"><ArrowLeft size={17}/>Return to SkillVerse</Link></div></main>;
}
