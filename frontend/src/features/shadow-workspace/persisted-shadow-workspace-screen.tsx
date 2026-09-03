"use client";

import { AlertCircle, ArrowRight, Calculator, Check, GitCompareArrows, LoaderCircle, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { AppShell } from "../../components/layout/app-shell";
import { useAuth } from "../../hooks/use-auth";
import { ApiError } from "../../services/api-client";
import { getPlan } from "../../services/plan-service";
import { getRequest } from "../../services/request-service";
import { evaluateRisk, getRisk } from "../../services/risk-service";
import { getSimulation } from "../../services/simulation-service";
import type { ExecutionPlan, PlanTarget } from "../../types/plan";
import type { ShadowRequest } from "../../types/request";
import type { RiskAssessment } from "../../types/risk";
import type { SimulationRun } from "../../types/simulation";

function formatDate(value: string) { return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "medium" }).format(new Date(value)); }
function formatLabel(value: string) { return value.replaceAll("_", " ").toLowerCase().replace(/^./, (letter) => letter.toUpperCase()); }
function displayValue(value: PlanTarget[string]) { if (value === null) return "None"; if (typeof value === "boolean") return value ? "Yes" : "No"; return String(value); }

function StateCard({ label, state, after }: { label: string; state: PlanTarget; after?: boolean }) {
  return <div className={`rounded-[8px] border p-4 ${after ? "border-[rgb(167_139_250/0.18)] bg-[rgb(167_139_250/0.025)]" : "border-white/[0.07] bg-black/20"}`}><p className={`text-[9px] font-medium uppercase tracking-[0.14em] ${after ? "text-[var(--intelligence)]" : "text-[var(--text-muted)]"}`}>{label}</p><dl className="mt-3 space-y-2">{Object.entries(state).map(([key,value]) => <div key={key} className="flex items-start justify-between gap-4 border-b border-white/[0.045] pb-2 last:border-0 last:pb-0"><dt className="text-[9px] text-[var(--text-muted)]">{formatLabel(key)}</dt><dd className={`text-right font-mono text-[9px] ${key === "deleted" && value ? "text-[var(--critical)]" : "text-[var(--text-secondary)]"}`}>{displayValue(value)}</dd></div>)}</dl></div>;
}

export function PersistedShadowWorkspaceScreen({ requestId }: { requestId: string }) {
  const { refreshSession } = useAuth();
  const [request, setRequest] = useState<ShadowRequest | null>(null);
  const [plan, setPlan] = useState<ExecutionPlan | null>(null);
  const [simulation, setSimulation] = useState<SimulationRun | null>(null);
  const [riskAssessment, setRiskAssessment] = useState<RiskAssessment | null>(null);
  const [evaluatingRisk, setEvaluatingRisk] = useState(false);
  const [riskError, setRiskError] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    Promise.all([getRequest(requestId), getPlan(requestId), getSimulation(requestId)]).then(([nextRequest,nextPlan,nextSimulation]) => {
      if (active) {
        setRequest(nextRequest); setPlan(nextPlan); setSimulation(nextSimulation);
        getRisk(requestId).then((nextRisk) => { if (active) setRiskAssessment(nextRisk); }).catch((caught: unknown) => {
          if (active && (!(caught instanceof ApiError) || caught.status !== 404)) setRiskError(caught instanceof ApiError ? caught.message : "Unable to check risk status.");
        });
      }
    }).catch((caught: unknown) => {
      if (!active) return;
      if (caught instanceof ApiError && caught.status === 401) void refreshSession();
      setError(caught instanceof ApiError ? caught.message : "Unable to load this Shadow Workspace.");
    });
    return () => { active = false; };
  }, [refreshSession, requestId]);

  async function handleEvaluateRisk() {
    setEvaluatingRisk(true);
    setRiskError("");
    try { setRiskAssessment(await evaluateRisk(requestId)); }
    catch (caught: unknown) {
      if (caught instanceof ApiError && caught.status === 401) void refreshSession();
      setRiskError(caught instanceof ApiError ? caught.message : "Unable to evaluate risk.");
    } finally { setEvaluatingRisk(false); }
  }

  if (error) return <AppShell pageTitle="Shadow Workspace"><main className="mx-auto max-w-4xl px-4 py-12"><div className="surface-panel rounded-[12px] border border-white/[0.08] p-6"><AlertCircle className="text-[var(--warning)]" size={20} /><h1 className="mt-4 text-xl font-semibold">Shadow Workspace unavailable</h1><p className="mt-2 text-sm text-[var(--text-secondary)]">{error}</p><Link href={`/action-plans/${requestId}`} className="mt-6 inline-flex rounded-[7px] bg-white px-4 py-2 text-xs font-medium text-black">Return to Action Plan</Link></div></main></AppShell>;
  if (!request || !plan || !simulation) return <AppShell pageTitle="Shadow Workspace"><main className="grid min-h-[60vh] place-items-center"><LoaderCircle className="animate-spin text-[var(--intelligence)]" /></main></AppShell>;

  return <AppShell pageTitle="Shadow Workspace"><main className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
    <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end"><div><p className="text-[10px] font-medium uppercase tracking-[0.18em] text-[var(--intelligence)]">Deterministic resource projection</p><h1 className="mt-2 text-3xl font-semibold tracking-[-0.035em]">Shadow Workspace</h1><p className="mt-2 max-w-2xl text-sm text-[var(--text-secondary)]">Inspect projected changes against an isolated synthetic dataset. No production system was accessed.</p></div><span className="flex w-fit items-center gap-2 rounded-[7px] border border-[rgb(93_211_158/0.25)] bg-[rgb(93_211_158/0.06)] px-3 py-2 text-xs text-[var(--safe)]"><Check size={14} />{simulation.status}</span></div>
    <section className="surface-panel relative mt-7 overflow-hidden rounded-[10px] border border-[rgb(167_139_250/0.28)] bg-[rgb(167_139_250/0.055)] p-4"><span className="absolute inset-x-0 top-0 h-px bg-[var(--intelligence)] opacity-70" /><div className="flex items-start gap-3"><span className="grid size-9 shrink-0 place-items-center rounded-[7px] border border-[rgb(167_139_250/0.24)] text-[var(--intelligence)]"><ShieldCheck size={18} /></span><div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--intelligence)]">Synthetic dataset · no real changes performed</p><p className="mt-1 text-xs text-[var(--text-secondary)]">Deterministic simulation only · generated {formatDate(simulation.createdAt)}</p></div></div></section>
    <section className="surface-panel mt-4 rounded-[12px] border border-white/[0.08] bg-[var(--surface)] p-5"><div className="flex flex-wrap justify-between gap-3"><span className="break-all font-mono text-[9px] text-[var(--text-muted)]">REQUEST / {request.id}</span><span className="font-mono text-[9px] text-[var(--text-muted)]">PLAN / {plan.id}</span></div><p className="mt-4 border-t border-white/[0.06] pt-4 text-base">“{request.prompt}”</p><p className="mt-2 text-[10px] text-[var(--text-secondary)]">{plan.summary} · Provider: {plan.provider}</p><dl className="mt-5 grid gap-px overflow-hidden rounded-[8px] border border-white/[0.07] bg-white/[0.07] sm:grid-cols-4">{[["Synthetic resources examined", simulation.totalResourcesExamined], ["Synthetic matches", simulation.matchedResources], ["Projected changes", simulation.affectedResources], ["With dependencies", simulation.dependencyObservations]].map(([label,value]) => <div key={label} className="bg-[var(--surface)] p-3.5"><dt className="text-[8px] uppercase tracking-wider text-[var(--text-muted)]">{label}</dt><dd className="mt-2 font-mono text-xl font-semibold">{value}</dd></div>)}</dl></section>
    <div className="mt-4 grid gap-4 xl:grid-cols-[1.35fr_0.65fr]"><section className="surface-panel rounded-[12px] border border-white/[0.08] bg-[var(--surface)] p-4 sm:p-6"><div className="flex items-center gap-2"><GitCompareArrows size={16} className="text-[var(--intelligence)]" /><h2 className="text-sm font-medium">Projected resource effects</h2></div><p className="mt-1 text-[10px] text-[var(--text-muted)]">Only resources whose synthetic state would change are shown.</p><div className="mt-5 space-y-4">{simulation.effects.map((effect) => <article key={effect.id} className="rounded-[10px] border border-white/[0.08] bg-[#0b0d10] p-4"><div className="flex flex-wrap items-center justify-between gap-2"><div><p className="font-mono text-xs font-semibold">{effect.resourceKey}</p><p className="mt-1 font-mono text-[8px] text-[var(--text-muted)]">{effect.effectType} / {effect.resourceType}</p></div><span className={`rounded-[5px] border px-2 py-1 font-mono text-[8px] ${effect.effectType === "DELETE_RESOURCE" ? "border-[rgb(239_98_98/0.25)] text-[var(--critical)]" : "border-[rgb(231_183_91/0.25)] text-[var(--warning)]"}`}>PROJECTED CHANGE</span></div><div className="mt-4 grid items-center gap-3 lg:grid-cols-[1fr_auto_1fr]"><StateCard label="Before" state={effect.beforeState} /><ArrowRight className="mx-auto text-[var(--text-muted)]" size={16} /><StateCard label="After" state={effect.afterState} after /></div></article>)}</div></section>
      <aside className="space-y-4"><section className="surface-panel rounded-[12px] border border-white/[0.08] bg-[var(--surface)] p-5"><h2 className="text-sm font-medium">Simulation summary</h2><p className="mt-3 text-[10px] leading-5 text-[var(--text-secondary)]">{simulation.summary}</p><dl className="mt-5 space-y-3">{[["Provider", "Synthetic"], ["Status", simulation.status], ["Environment", formatLabel(request.environment)], ["Effects persisted", simulation.effects.length]].map(([label,value]) => <div key={label} className="flex justify-between gap-4 border-b border-white/[0.05] pb-3"><dt className="text-[9px] text-[var(--text-muted)]">{label}</dt><dd className="font-mono text-[9px] text-[var(--text-secondary)]">{value}</dd></div>)}</dl></section><section className="rounded-[10px] border border-[rgb(167_139_250/0.2)] bg-[rgb(167_139_250/0.04)] p-4"><div className="flex items-center gap-2"><Calculator size={15} className="text-[var(--intelligence)]" /><h2 className="text-xs font-medium">Explainable risk</h2></div><p className="mt-2 text-[10px] leading-5 text-[var(--text-secondary)]">Calculate risk deterministically from this persisted request, plan, and simulation.</p>{riskError && <p className="mt-3 text-[10px] text-[var(--critical)]">{riskError}</p>}{riskAssessment ? <div className="mt-4"><p className="font-mono text-xl font-semibold">{riskAssessment.score} <span className="text-[10px] text-[var(--warning)]">{riskAssessment.level}</span></p><Link href={`/risk/${requestId}`} className="mt-3 inline-flex rounded-[7px] bg-white px-3 py-2 text-[10px] font-medium text-black">Open Risk Assessment</Link></div> : <button type="button" disabled={evaluatingRisk} onClick={() => void handleEvaluateRisk()} className="mt-4 inline-flex items-center gap-2 rounded-[7px] bg-white px-3 py-2 text-[10px] font-medium text-black disabled:opacity-60">{evaluatingRisk && <LoaderCircle size={12} className="animate-spin" />}Evaluate Risk</button>}</section><div className="rounded-[10px] border border-white/[0.08] p-4"><p className="text-[10px] leading-5 text-[var(--text-secondary)]">These are factual synthetic projections only. Policy, approval, and execution decisions have not been performed.</p></div></aside>
    </div>
  </main></AppShell>;
}
