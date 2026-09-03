"use client";

import { AlertCircle, ArrowDown, ArrowRight, Check, FileCode2, LoaderCircle, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { AppShell } from "../../components/layout/app-shell";
import { useAuth } from "../../hooks/use-auth";
import { ApiError } from "../../services/api-client";
import { getPlan } from "../../services/plan-service";
import { getRequest } from "../../services/request-service";
import { getSimulation, runSimulation } from "../../services/simulation-service";
import type { ExecutionPlan, PlanAction } from "../../types/plan";
import type { ShadowRequest } from "../../types/request";
import type { SimulationRun } from "../../types/simulation";

const actionTone: Record<PlanAction["type"], string> = {
  QUERY_RESOURCE: "border-l-[var(--info)] text-[var(--info)]",
  VALIDATE_SCOPE: "border-l-[var(--intelligence)] text-[var(--intelligence)]",
  CREATE_RESOURCE: "border-l-[var(--safe)] text-[var(--safe)]",
  UPDATE_RESOURCE: "border-l-[var(--warning)] text-[var(--warning)]",
  ARCHIVE_RESOURCE: "border-l-[var(--warning)] text-[var(--warning)]",
  DELETE_RESOURCE: "border-l-[var(--critical)] text-[var(--critical)]",
};

function formatValue(value: string) { return value.toLowerCase().replaceAll("_", " ").replace(/^./, (letter) => letter.toUpperCase()); }
function formatDate(value: string) { return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "medium" }).format(new Date(value)); }

export function PersistedActionPlanScreen({ requestId }: { requestId: string }) {
  const { refreshSession } = useAuth();
  const [request, setRequest] = useState<ShadowRequest | null>(null);
  const [plan, setPlan] = useState<ExecutionPlan | null>(null);
  const [error, setError] = useState("");
  const [simulation, setSimulation] = useState<SimulationRun | null>(null);
  const [simulating, setSimulating] = useState(false);
  const [simulationError, setSimulationError] = useState("");

  useEffect(() => {
    let active = true;
    Promise.all([getRequest(requestId), getPlan(requestId)]).then(([nextRequest, nextPlan]) => {
      if (active) { setRequest(nextRequest); setPlan(nextPlan); }
    }).catch((caught: unknown) => {
      if (!active) return;
      if (caught instanceof ApiError && caught.status === 401) void refreshSession();
      setError(caught instanceof ApiError && caught.code === "PLAN_NOT_FOUND" ? "No persisted action plan exists for this request." : caught instanceof ApiError ? caught.message : "Unable to load this action plan.");
    });
    getSimulation(requestId).then((existing) => { if (active) setSimulation(existing); }).catch((caught: unknown) => {
      if (active && caught instanceof ApiError && caught.status === 401) void refreshSession();
    });
    return () => { active = false; };
  }, [refreshSession, requestId]);

  async function handleSimulation() {
    if (simulating) return;
    setSimulating(true);
    setSimulationError("");
    try { setSimulation(await runSimulation(requestId)); }
    catch (caught) {
      if (caught instanceof ApiError && caught.status === 401) void refreshSession();
      setSimulationError(caught instanceof ApiError ? caught.message : "Unable to run the Shadow simulation.");
    } finally { setSimulating(false); }
  }

  if (error) return <AppShell pageTitle="Action Plans"><main className="mx-auto max-w-4xl px-4 py-12"><div className="surface-panel rounded-[12px] border border-white/[0.08] p-6"><AlertCircle className="text-[var(--warning)]" size={20} /><h1 className="mt-4 text-xl font-semibold">Action plan unavailable</h1><p className="mt-2 text-sm text-[var(--text-secondary)]">{error}</p><Link href="/command-center" className="mt-6 inline-flex rounded-[7px] bg-white px-4 py-2 text-xs font-medium text-black">Return to Command Center</Link></div></main></AppShell>;
  if (!request || !plan) return <AppShell pageTitle="Action Plans"><main className="grid min-h-[60vh] place-items-center"><LoaderCircle className="animate-spin text-[var(--intelligence)]" /></main></AppShell>;

  return <AppShell pageTitle="Action Plans"><main className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
    <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end"><div><p className="text-[10px] font-medium uppercase tracking-[0.18em] text-[var(--info)]">Persisted execution specification</p><h1 className="mt-2 text-3xl font-semibold tracking-[-0.035em]">Action Plan</h1><p className="mt-2 max-w-2xl text-sm text-[var(--text-secondary)]">A deterministic sequence of intended semantic actions. Nothing has been simulated or executed.</p></div><span className="flex w-fit items-center gap-2 rounded-[7px] border border-[rgb(93_211_158/0.25)] bg-[rgb(93_211_158/0.06)] px-3 py-2 text-xs text-[var(--safe)]"><ShieldCheck size={14} />Structure validated · persisted</span></div>
    <section className="surface-panel mt-7 rounded-[12px] border border-white/[0.08] bg-[var(--surface)] p-4 sm:p-5"><div className="flex flex-wrap justify-between gap-3"><span className="break-all font-mono text-[9px] text-[var(--text-muted)]">REQUEST / {request.id}</span><span className="font-mono text-[9px] text-[var(--text-muted)]">GENERATED / {formatDate(plan.createdAt)}</span></div><p className="mt-5 border-t border-white/[0.06] pt-5 text-lg tracking-[-0.015em]">“{request.prompt}”</p><p className="mt-3 text-xs leading-5 text-[var(--text-secondary)]">{plan.summary}</p><dl className="mt-5 grid gap-px overflow-hidden rounded-[8px] border border-white/[0.07] bg-white/[0.07] sm:grid-cols-4">{[["Request status", request.status], ["Environment", formatValue(request.environment)], ["Planner", "Deterministic simulation"], ["Actions", `${plan.actions.length} ordered`]].map(([label,value]) => <div key={label} className="bg-[var(--surface)] p-3.5"><dt className="text-[9px] uppercase tracking-wider text-[var(--text-muted)]">{label}</dt><dd className="mt-2 text-xs font-medium">{value}</dd></div>)}</dl></section>
    <div className="mt-4 grid gap-4 xl:grid-cols-[1.35fr_0.65fr]"><section className="surface-panel rounded-[12px] border border-white/[0.08] bg-[var(--surface)] p-4 sm:p-6"><h2 className="text-sm font-medium">Ordered semantic actions</h2><p className="mt-1 text-[10px] text-[var(--text-muted)]">Provider output · allowlist validated · no executable commands</p><div className="mx-auto mt-7 max-w-3xl">{plan.actions.map((action,index) => <div key={action.id} className="relative pb-9 last:pb-0"><article className={`rounded-[9px] border border-white/[0.08] border-l-2 bg-[#0b0d10] ${actionTone[action.type]}`}><div className="grid gap-4 p-4 sm:grid-cols-[48px_1fr]"><div><p className="font-mono text-[9px] opacity-60">ACTION</p><p className="mt-1 font-mono text-lg">{String(action.position).padStart(2,"0")}</p></div><div><div className="flex flex-wrap gap-2 font-mono text-xs font-semibold"><span>{action.type}</span><span className="text-[var(--text-muted)]">/ {action.resourceType}</span></div><p className="mt-3 text-xs text-[var(--text-secondary)]">{action.description}</p><dl className="mt-4 grid gap-3 text-[10px] sm:grid-cols-3"><div><dt className="text-[8px] uppercase text-[var(--text-muted)]">Destructive</dt><dd className={action.destructive ? "mt-1 text-[var(--critical)]" : "mt-1 text-[var(--safe)]"}>{action.destructive ? "Yes" : "No"}</dd></div><div><dt className="text-[8px] uppercase text-[var(--text-muted)]">Reversible</dt><dd className="mt-1 text-[var(--text-secondary)]">{action.reversible ? "Yes" : "No"}</dd></div><div><dt className="text-[8px] uppercase text-[var(--text-muted)]">Estimated scope</dt><dd className="mt-1 text-[var(--text-secondary)]">{action.estimatedScope ?? "Not calculated"}</dd></div></dl><p className="mt-4 border-t border-white/[0.06] pt-3 text-[10px] text-[var(--text-muted)]">{action.reason}</p></div></div></article>{index < plan.actions.length - 1 && <div className="absolute bottom-1 left-1/2 flex -translate-x-1/2 flex-col items-center"><span className="h-5 w-px bg-white/15" /><ArrowDown size={13} /></div>}</div>)}</div></section>
      <aside className="space-y-4"><section className="surface-panel rounded-[12px] border border-white/[0.08] bg-[var(--surface)] p-5"><div className="flex items-center gap-2"><FileCode2 size={16} className="text-[var(--info)]" /><h2 className="text-sm font-medium">Plan inspector</h2></div><dl className="mt-5 space-y-3">{[["Plan ID", plan.id], ["Provider", plan.provider], ["Status", plan.status], ["Request", request.id]].map(([label,value]) => <div key={label} className="border-b border-white/[0.05] pb-3 last:border-0"><dt className="text-[9px] text-[var(--text-muted)]">{label}</dt><dd className="mt-1 break-all font-mono text-[9px] text-[var(--text-secondary)]">{value}</dd></div>)}</dl></section><section className="surface-panel rounded-[12px] border border-white/[0.08] bg-[var(--surface)] p-5"><div className="flex items-center gap-2"><Check size={15} className="text-[var(--safe)]" /><h2 className="text-sm font-medium">Shadow simulation</h2></div><p className="mt-3 text-[10px] leading-5 text-[var(--text-muted)]">Project this plan against an isolated deterministic dataset. No production resources will be accessed or changed.</p>{simulationError && <p role="alert" className="mt-3 text-[10px] text-[var(--critical)]">{simulationError}</p>}{simulation ? <Link href={`/shadow-workspace/${requestId}`} className="mt-4 flex items-center justify-center gap-2 rounded-[7px] bg-white px-3 py-2.5 text-xs font-medium text-black">Open Shadow Workspace <ArrowRight size={13} /></Link> : <button type="button" onClick={() => void handleSimulation()} disabled={simulating} className="mt-4 flex w-full items-center justify-center gap-2 rounded-[7px] border border-[rgb(167_139_250/0.3)] bg-[rgb(167_139_250/0.08)] px-3 py-2.5 text-xs font-medium text-[var(--intelligence)] disabled:opacity-50">{simulating && <LoaderCircle size={13} className="animate-spin" />}{simulating ? "Running simulation" : "Run Shadow Simulation"}</button>}</section></aside>
    </div>
  </main></AppShell>;
}
