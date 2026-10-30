"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, Fingerprint, ScanLine, ShieldCheck, Network, FileSearch, AudioWaveform, LockKeyhole, ChevronDown } from "lucide-react";
const engines = [
 ["Identity Guardian","Investigate identity documents and identity-related inconsistencies.",Fingerprint,"/app/engines/identity"],
 ["Document Verifier","Inspect PDFs and certificates for suspicious structural and visual signals.",FileSearch,"/app/engines/document"],
 ["Media Truth Engine","Analyse images, video and audio for manipulation indicators.",ScanLine,"/app/engines/media"],
 ["Source Tracker","Compare cryptographic fingerprints and inspect available provenance.",LockKeyhole,"/app/engines/source"],
 ["Trust Graph","Explore evidence-backed relationships between files and investigations.",Network,"/app/trust-graph"],
 ["AI Risk Analyzer","Understand findings, uncertainty and evidence coverage.",ShieldCheck,"/app/engines/risk"],
 ["Verification Hub","Manage investigations, evidence and reports in one workspace.",AudioWaveform,"/app/dashboard"]
];
export default function Home(){
 return <main className="landing">
  <nav className="topnav"><Link href="/" className="brand"><span className="brandmark"><Fingerprint size={22}/></span> BEYOND<span>PROOF</span></Link><div className="navlinks"><a href="#platform">Platform</a><a href="#engines">Engines</a><a href="#workflow">How it works</a></div><div className="navright"><Link href="/login" className="navlogin">Sign in</Link><Link href="/app/dashboard" className="button button-small">Launch platform <ArrowUpRight size={15}/></Link></div></nav>
  <section className="hero">
   <div className="hero-grid"></div><div className="orb orb-one"></div><div className="orb orb-two"></div>
   <div className="hero-copy"><div className="eyebrow"><span className="pulse"></span> DIGITAL FORENSICS INTELLIGENCE</div>
    <h1>IN A WORLD OF<br/><em>FAKE EVERYTHING.</em><br/>VERIFY WHAT'S REAL.</h1>
    <p>Investigate digital authenticity with AI-powered forensic analysis, cryptographic verification and evidence-backed provenance intelligence.</p>
    <div className="hero-actions"><Link href="/app/investigations/new" className="button">Start investigation <ArrowUpRight size={17}/></Link><a href="#platform" className="button button-ghost">Explore platform <ChevronDown size={16}/></a></div>
    <div className="hero-meta"><span><i className="dot-green"/> FORENSIC WORKSPACE</span><span>7 CONNECTED ENGINES</span><span>EXPLAINABLE FINDINGS</span></div>
   </div>
   <div className="fingerprint-stage"><div className="scan-halo halo-a"></div><div className="scan-halo halo-b"></div><div className="fingerprint"><Fingerprint size={240} strokeWidth={0.65}/></div><div className="scan-line"></div><div className="float-label label-a">SIGNAL DETECTED <b>●</b></div><div className="float-label label-b">EVIDENCE / 001 <b>↗</b></div><div className="float-label label-c">INTEGRITY SCAN <b>ACTIVE</b></div></div>
   <div className="scroll-cue">SCROLL TO EXPLORE <span>↓</span></div>
  </section>
  <section className="intro section-wrap" id="platform"><div><div className="eyebrow">THE TRUST GAP</div><h2>Digital evidence deserves<br/><em>more than a guess.</em></h2></div><p>AI-generated media and sophisticated manipulation make authenticity harder to establish. BEYONDPROOF brings forensic signals, file integrity and available provenance into one explainable investigation workflow.</p></section>
  <section className="engine-section section-wrap" id="engines"><div className="section-heading"><div><div className="eyebrow">THE FORENSIC CORE / 07 ENGINES</div><h2>One platform.<br/><em>Seven ways to investigate.</em></h2></div><Link href="/app/dashboard" className="text-link">Open workspace <ArrowUpRight size={16}/></Link></div>
   <div className="engine-grid">{engines.map(([name,desc,Icon,href],i)=><Link href={String(href)} className="engine-card" key={String(name)}><div className="engine-top"><span>0{i+1} / ENGINE</span><Icon size={23}/></div><h3>{String(name)}</h3><p>{String(desc)}</p><div className="engine-foot">EXPLORE ENGINE <ArrowUpRight size={15}/></div></Link>)}</div>
  </section>
  <section className="workflow section-wrap" id="workflow"><div className="eyebrow">INVESTIGATION PIPELINE</div><h2>From upload to<br/><em>evidence-led clarity.</em></h2><div className="workflow-steps">{["Upload evidence","Extract signals","Run forensic analysis","Correlate evidence","Assess risk","Generate report"].map((s,i)=><div className="workflow-step" key={s}><span>0{i+1}</span><b>{s}</b><small>{i===0?"Secure intake":i===1?"Metadata & content":i===2?"Relevant engines":i===3?"Evidence relationships":i===4?"Explainable status":"Downloadable PDF"}</small></div>)}</div></section>
  <section className="closing"><div className="eyebrow">BEYOND TRUST. BEYOND DOUBT.</div><h2>Trust should be verified.<br/><em>Not assumed.</em></h2><Link href="/app/investigations/new" className="button">Launch BEYONDPROOF <ArrowUpRight size={17}/></Link></section>
  <footer><Link href="/" className="brand"><Fingerprint size={19}/> BEYOND<span>PROOF</span></Link><span>BUILT BY BBC — BUILT BEYOND CODE</span><span>© 2026 BEYONDPROOF</span></footer>
 </main>
}
