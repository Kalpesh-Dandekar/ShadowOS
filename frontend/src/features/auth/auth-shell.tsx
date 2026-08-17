import { CheckCircle2, CircleDashed, ShieldCheck } from "lucide-react";
import type { ReactNode } from "react";

import { Brand } from "../../components/ui/brand";

export function AuthShell({ children }: { children: ReactNode }) {
  const stages = ["Plan inspected", "Risk evaluated", "Policy enforced", "Human approved"];
  return (
    <main className="grid min-h-screen bg-[var(--background)] lg:grid-cols-[1.08fr_0.92fr]">
      <section className="technical-grid relative hidden overflow-hidden border-r border-white/[0.07] bg-[radial-gradient(circle_at_32%_44%,rgb(106_168_255/0.06),transparent_28rem)] p-10 lg:flex lg:flex-col lg:justify-between xl:p-14">
        <Brand />
        <div className="relative z-10 max-w-xl">
          <p className="mb-5 text-xs font-medium uppercase tracking-[0.2em] text-[var(--safe)]">Governed AI execution</p>
          <h1 className="text-5xl font-semibold leading-[1.06] tracking-[-0.045em] xl:text-6xl">AI agents move fast.<br /><span className="text-[var(--text-muted)]">Governance should move faster.</span></h1>
          <p className="mt-6 max-w-lg text-base leading-7 text-[var(--text-secondary)]">Inspect, simulate, authorize, and audit AI-generated operations before they reach production.</p>
          <div className="surface-panel mt-10 max-w-md rounded-[12px] border border-white/10 bg-[#0b0d10e6] p-5 shadow-[var(--shadow-panel)]">
            <div className="mb-5 flex items-center justify-between"><span className="font-mono text-[10px] uppercase tracking-[0.15em] text-[var(--text-muted)]">Execution gate / REQ-8F2A</span><span className="size-1.5 rounded-full bg-[var(--warning)]" /></div>
            <div className="space-y-3">{stages.map((stage, index) => <div key={stage} className="flex items-center gap-3 text-sm"><span className={index < 3 ? "text-[var(--safe)]" : "text-[var(--warning)]"}>{index < 3 ? <CheckCircle2 size={16} /> : <CircleDashed size={16} />}</span><span className="text-[var(--text-secondary)]">{stage}</span><span className="ml-auto font-mono text-[10px] text-[var(--text-muted)]">{index < 3 ? "PASS" : "WAIT"}</span></div>)}</div>
            <div className="signal-line mt-5 h-px opacity-50" />
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]"><ShieldCheck size={15} /> Safe execution is a system property.</div>
      </section>
      <section className="flex min-h-screen items-center justify-center bg-[linear-gradient(145deg,rgb(255_255_255/0.012),transparent_45%)] px-5 py-12 sm:px-10">
        <div className="page-enter w-full max-w-[410px]">
          <div className="mb-10 lg:hidden"><Brand /></div>
          {children}
        </div>
      </section>
    </main>
  );
}
