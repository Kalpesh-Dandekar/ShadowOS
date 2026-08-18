import { ArrowRight, Check, Code2, ShieldCheck } from "lucide-react";
import Link from "next/link";

import { Brand } from "../../components/ui/brand";

const stages = ["Request", "Plan", "Simulate", "Risk", "Policy", "Approval", "Execution", "Audit"];
const capabilities = [
  ["01", "Structured action planning", "Translate intent into inspectable operations."],
  ["02", "Safe simulation", "Preview impact before resources are touched."],
  ["03", "Explainable risk", "Surface severity, blast radius, and rationale."],
  ["04", "Policy enforcement", "Evaluate every action against organizational controls."],
  ["05", "Human approval", "Route consequential actions to accountable operators."],
  ["06", "Controlled execution", "Release only authorized operations into production."],
  ["07", "Complete audit trail", "Preserve the evidence behind every decision."],
  ["08", "Rollback support", "Design execution with recovery in mind."],
];

export function LandingPage() {
  return (
    <div className="min-h-screen overflow-hidden">
      <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-[#08090bf2] backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1240px] items-center justify-between px-5 lg:px-8">
          <Brand />
          <nav className="hidden items-center gap-7 text-sm text-[var(--text-secondary)] md:flex" aria-label="Primary navigation">
            <a href="#product" className="hover:text-white">Product</a>
            <a href="#platform" className="hover:text-white">Platform</a>
            <a href="#security" className="hover:text-white">Security</a>
            <a href="#architecture" className="hover:text-white">Architecture</a>
          </nav>
          <div className="flex items-center gap-2">
            <a href="https://github.com/Kalpesh-Dandekar/ShadowOS" className="hidden p-2 text-[var(--text-secondary)] hover:text-white sm:block" aria-label="ShadowOS source code on GitHub"><Code2 size={18} /></a>
            <Link href="/login" className="px-3 py-2 text-sm text-[var(--text-secondary)] hover:text-white">Login</Link>
            <Link href="/dashboard" className="rounded-[7px] bg-white px-3.5 py-2 text-sm font-medium text-black hover:bg-zinc-200">Enter ShadowOS</Link>
          </div>
        </div>
      </header>

      <main>
        <section id="product" className="relative border-b border-white/[0.06]">
          <div className="technical-grid absolute inset-0 opacity-50 [mask-image:linear-gradient(to_bottom,black,transparent_88%)]" />
          <div className="relative mx-auto grid max-w-[1240px] gap-14 px-5 py-20 lg:min-h-[680px] lg:grid-cols-[1fr_0.9fr] lg:px-8 lg:py-24">
            <div className="max-w-2xl self-center">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-[var(--text-secondary)]">
                <span className="size-1.5 rounded-full bg-[var(--safe)] shadow-[0_0_10px_var(--safe)]" />
                AI execution control plane
              </div>
              <h1 className="text-balance text-5xl font-semibold leading-[1.02] tracking-[-0.05em] sm:text-6xl lg:text-[68px]">
                AI agents move fast.<br /><span className="text-[var(--text-muted)]">Governance should move faster.</span>
              </h1>
              <p className="mt-7 max-w-xl text-lg leading-8 text-[var(--text-secondary)]">
                ShadowOS governs AI-generated operations before they reach production resources—turning autonomous intent into controlled, explainable execution.
              </p>
              <div className="mt-9 flex flex-wrap gap-3">
                <Link href="/dashboard" className="inline-flex items-center gap-2 rounded-[8px] bg-white px-5 py-3 text-sm font-medium text-black hover:bg-zinc-200">Open Governance Console <ArrowRight size={16} /></Link>
                <a href="#architecture" className="rounded-[8px] border border-white/10 bg-white/[0.03] px-5 py-3 text-sm text-white hover:bg-white/[0.06]">See How It Works</a>
              </div>
            </div>

            <div id="architecture" className="surface-panel relative self-center rounded-[14px] border border-white/10 bg-[#0b0d10f2] p-4 shadow-[var(--shadow-panel)] sm:p-6">
              <div className="mb-5 flex items-center justify-between border-b border-white/[0.07] pb-4">
                <div><p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--text-muted)]">Control plane / active</p><p className="mt-1 text-sm">Request governance pipeline</p></div>
                <span className="rounded-full border border-[color:rgb(93_211_158/0.25)] bg-[rgb(93_211_158/0.08)] px-2 py-1 text-[10px] font-medium uppercase tracking-wider text-[var(--safe)]">Operational</span>
              </div>
              <div className="mb-3 grid grid-cols-2 gap-3 border-b border-white/[0.06] pb-4 font-mono text-[9px] uppercase tracking-[0.12em] text-[var(--text-muted)]"><span>REQ-8F2A</span><span className="text-right">Policy / POL-BULK-DELETE-04</span></div>
              <div className="space-y-1">
                {stages.map((stage, index) => (
                  <div key={stage} className="group relative flex items-center gap-4 rounded-[7px] border border-transparent px-3 py-2.5 transition-colors hover:border-white/[0.07] hover:bg-white/[0.025]">
                    <span className="font-mono text-[10px] text-[var(--text-muted)]">{String(index + 1).padStart(2, "0")}</span>
                    <span className={`size-2 rounded-full ${index < 5 ? "bg-[var(--safe)]" : index === 5 ? "bg-[var(--warning)]" : "border border-white/20"}`} />
                    <span className="text-xs font-medium uppercase tracking-[0.14em] text-[var(--text-secondary)]">{stage}</span>
                    <span className="ml-auto font-mono text-[10px] text-[var(--text-muted)]">{index < 5 ? "verified" : index === 5 ? "awaiting" : "queued"}</span>
                    {index < stages.length - 1 && <span className="absolute left-[48px] top-[30px] h-[13px] w-px bg-white/10" />}
                  </div>
                ))}
              </div>
              <div className="signal-line mt-5 h-px opacity-60" />
            </div>
          </div>
        </section>

        <section id="platform" className="mx-auto max-w-[1240px] px-5 py-24 lg:px-8 lg:py-28">
          <div className="grid gap-10 lg:grid-cols-[0.7fr_1.3fr]">
            <div><p className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--safe)]">Govern before execution</p><h2 className="mt-4 text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">AI output is a proposal.<br />Not permission.</h2><p className="mt-5 max-w-md leading-7 text-[var(--text-secondary)]">ShadowOS inserts a verifiable control layer between machine-generated intent and organizational resources.</p></div>
            <div className="grid border-l border-t border-white/[0.07] sm:grid-cols-2">
              {capabilities.map(([number, title, copy]) => <div key={number} className="group border-b border-r border-white/[0.07] p-5 transition-colors hover:bg-white/[0.018]"><span className="font-mono text-[10px] text-[var(--text-muted)] transition-colors group-hover:text-[var(--safe)]">{number}</span><h3 className="mt-5 text-sm font-medium">{title}</h3><p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">{copy}</p></div>)}
            </div>
          </div>
        </section>

        <section id="security" className="border-y border-white/[0.06] bg-[var(--surface)]">
          <div className="mx-auto grid max-w-[1240px] gap-8 px-5 py-20 lg:grid-cols-[0.75fr_1.25fr] lg:px-8">
            <div><p className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--intelligence)]">Operational example</p><h2 className="mt-4 text-3xl font-semibold tracking-[-0.03em]">From natural language<br />to governed action.</h2></div>
            <div className="surface-panel rounded-[12px] border border-white/10 bg-[#0a0c0f] p-5 sm:p-7">
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--text-muted)]">AI request / REQ-8F2A</p>
              <p className="mt-3 text-lg">“Delete archived invoices older than January 2024”</p>
              <div className="mt-7 grid gap-px overflow-hidden rounded-[8px] border border-white/[0.08] bg-white/[0.08] sm:grid-cols-4">
                {[ ["Simulation", "143 resources", "text-white"], ["Risk", "High · 72/100", "text-[var(--high-risk)]"], ["Policy", "Approval required", "text-[var(--warning)]"], ["Execution", "Blocked safely", "text-[var(--critical)]"] ].map(([label, value, color]) => <div key={label} className="bg-[var(--surface)] p-4"><p className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">{label}</p><p className={`mt-2 text-sm font-medium ${color}`}>{value}</p></div>)}
              </div>
              <div className="mt-5 flex items-start gap-3 text-sm text-[var(--text-secondary)]"><ShieldCheck className="mt-0.5 shrink-0 text-[var(--safe)]" size={17} /><span>Destructive action held before production impact. Full decision evidence retained.</span></div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1240px] px-5 py-24 lg:px-8">
          <div className="flex flex-col justify-between gap-8 border-t border-white/10 pt-10 sm:flex-row sm:items-end"><div><div className="flex items-center gap-2 text-sm text-[var(--safe)]"><Check size={15} /> Built for accountable autonomy</div><h2 className="mt-4 text-3xl font-semibold tracking-[-0.03em]">Put every AI action under control.</h2></div><Link href="/login" className="inline-flex items-center gap-2 self-start rounded-[8px] bg-white px-5 py-3 text-sm font-medium text-black">Enter ShadowOS <ArrowRight size={16} /></Link></div>
        </section>
      </main>
    </div>
  );
}
