"use client";

import { AlertCircle, Calculator, FileCheck2, LoaderCircle, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { AppShell } from "../../components/layout/app-shell";
import { useAuth } from "../../hooks/use-auth";
import { ApiError } from "../../services/api-client";
import { getPlan } from "../../services/plan-service";
import { evaluatePolicy, getPolicyEvaluation } from "../../services/policy-service";
import { getRequest } from "../../services/request-service";
import { getRisk } from "../../services/risk-service";
import { getSimulation } from "../../services/simulation-service";
import type { ExecutionPlan } from "../../types/plan";
import type { PolicyEvaluation } from "../../types/policy";
import type { ShadowRequest } from "../../types/request";
import type { RiskAssessment, RiskLevel } from "../../types/risk";
import type { SimulationRun } from "../../types/simulation";

const levelStyle: Record<RiskLevel, string> = {
  LOW: "border-[rgb(93_211_158/0.3)] bg-[rgb(93_211_158/0.07)] text-[var(--safe)]",
  MEDIUM: "border-[rgb(231_183_91/0.3)] bg-[rgb(231_183_91/0.07)] text-[var(--warning)]",
  HIGH: "border-[rgb(239_142_98/0.3)] bg-[rgb(239_142_98/0.07)] text-orange-300",
  CRITICAL: "border-[rgb(239_98_98/0.3)] bg-[rgb(239_98_98/0.07)] text-[var(--critical)]",
};

function observed(value: RiskAssessment["factors"][number]["observedValue"]) {
  return typeof value === "object" && value !== null ? JSON.stringify(value) : String(value);
}

export function PersistedRiskScreen({ requestId }: { requestId: string }) {
  const { refreshSession } = useAuth();
  const [request, setRequest] = useState<ShadowRequest | null>(null);
  const [plan, setPlan] = useState<ExecutionPlan | null>(null);
  const [simulation, setSimulation] = useState<SimulationRun | null>(null);
  const [assessment, setAssessment] = useState<RiskAssessment | null>(null);
  const [policy, setPolicy] = useState<PolicyEvaluation | null>(null);
  const [evaluatingPolicy, setEvaluatingPolicy] = useState(false);
  const [policyError, setPolicyError] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    Promise.all([getRequest(requestId), getPlan(requestId), getSimulation(requestId), getRisk(requestId)])
      .then(([nextRequest, nextPlan, nextSimulation, nextAssessment]) => {
        if (active) { setRequest(nextRequest); setPlan(nextPlan); setSimulation(nextSimulation); setAssessment(nextAssessment); getPolicyEvaluation(requestId).then((value) => { if (active) setPolicy(value); }).catch((caught: unknown) => { if (active && (!(caught instanceof ApiError) || caught.status !== 404)) setPolicyError(caught instanceof ApiError ? caught.message : "Unable to check policy status."); }); }
      })
      .catch((caught: unknown) => {
        if (!active) return;
        if (caught instanceof ApiError && caught.status === 401) void refreshSession();
        setError(caught instanceof ApiError ? caught.message : "Unable to load this risk assessment.");
      });
    return () => { active = false; };
  }, [refreshSession, requestId]);

  async function handleEvaluatePolicy() { setEvaluatingPolicy(true); setPolicyError(""); try { setPolicy(await evaluatePolicy(requestId)); } catch (caught: unknown) { if (caught instanceof ApiError && caught.status === 401) void refreshSession(); setPolicyError(caught instanceof ApiError ? caught.message : "Unable to evaluate policy."); } finally { setEvaluatingPolicy(false); } }

  if (error) return <AppShell pageTitle="Risk Engine"><main className="mx-auto max-w-4xl px-4 py-12"><div className="surface-panel rounded-[12px] border border-white/[0.08] p-6"><AlertCircle className="text-[var(--warning)]" size={20} /><h1 className="mt-4 text-xl font-semibold">Risk assessment unavailable</h1><p className="mt-2 text-sm text-[var(--text-secondary)]">{error}</p><Link href={`/shadow-workspace/${requestId}`} className="mt-6 inline-flex rounded-[7px] bg-white px-4 py-2 text-xs font-medium text-black">Return to Shadow Workspace</Link></div></main></AppShell>;
  if (!request || !plan || !simulation || !assessment) return <AppShell pageTitle="Risk Engine"><main className="grid min-h-[60vh] place-items-center"><LoaderCircle className="animate-spin text-[var(--intelligence)]" /></main></AppShell>;

  return <AppShell pageTitle="Risk Engine"><main className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
    <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end"><div><p className="text-[10px] font-medium uppercase tracking-[0.18em] text-[var(--intelligence)]">Explainable deterministic assessment</p><h1 className="mt-2 text-3xl font-semibold tracking-[-0.035em]">Risk Engine</h1><p className="mt-2 max-w-2xl text-sm text-[var(--text-secondary)]">A reproducible weighted calculation based only on the persisted request, plan, and synthetic simulation.</p></div><div className={`flex items-center gap-3 rounded-[10px] border px-5 py-3 ${levelStyle[assessment.level]}`}><span className="font-mono text-3xl font-semibold">{assessment.score}</span><span className="text-[10px] font-semibold tracking-[0.16em]">{assessment.level}</span></div></div>
    <section className="surface-panel mt-7 rounded-[12px] border border-white/[0.08] bg-[var(--surface)] p-5"><div className="flex items-start gap-3"><span className="grid size-9 shrink-0 place-items-center rounded-[7px] border border-[rgb(167_139_250/0.24)] text-[var(--intelligence)]"><ShieldCheck size={18} /></span><div><p className="text-xs font-semibold">{assessment.summary}</p><p className="mt-1 text-[10px] text-[var(--text-secondary)]">Risk scoring used no AI inference or production access. Policy is evaluated as a separate explicit stage; no approval or execution is performed here.</p></div></div><div className="mt-5 grid gap-3 border-t border-white/[0.06] pt-4 sm:grid-cols-3"><div><p className="text-[8px] uppercase tracking-wider text-[var(--text-muted)]">Request</p><p className="mt-2 truncate font-mono text-[9px]">{request.id}</p></div><div><p className="text-[8px] uppercase tracking-wider text-[var(--text-muted)]">Plan</p><p className="mt-2 truncate font-mono text-[9px]">{plan.id}</p></div><div><p className="text-[8px] uppercase tracking-wider text-[var(--text-muted)]">Simulation</p><p className="mt-2 truncate font-mono text-[9px]">{simulation.id}</p></div></div></section>
    <section className="mt-5"><div className="flex items-center gap-2"><Calculator size={16} className="text-[var(--intelligence)]" /><h2 className="text-sm font-medium">Risk factor calculation</h2></div><div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{assessment.factors.map((factor) => <article key={factor.id} className="surface-panel rounded-[12px] border border-white/[0.08] bg-[var(--surface)] p-5"><div className="flex justify-between gap-4"><div><p className="text-sm font-medium">{factor.label}</p><p className="mt-1 font-mono text-[8px] text-[var(--text-muted)]">{factor.key} / {factor.sourceType}</p></div><span className="font-mono text-lg font-semibold text-[var(--intelligence)]">+{factor.contribution}</span></div><dl className="mt-5 grid grid-cols-3 gap-2 rounded-[8px] border border-white/[0.06] bg-black/20 p-3">{[["Observed", observed(factor.observedValue)], ["Normalized", factor.normalizedScore], ["Weight", `${Math.round(factor.weight * 100)}%`]].map(([label,value]) => <div key={label}><dt className="text-[7px] uppercase tracking-wider text-[var(--text-muted)]">{label}</dt><dd className="mt-1 break-words font-mono text-[9px]">{value}</dd></div>)}</dl><p className="mt-4 text-[10px] leading-5 text-[var(--text-secondary)]">{factor.explanation}</p></article>)}</div></section>
    <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-[10px] border border-[rgb(167_139_250/0.2)] bg-[rgb(167_139_250/0.04)] p-4"><div><div className="flex items-center gap-2"><FileCheck2 size={15} className="text-[var(--safe)]" /><p className="text-xs font-medium">Deterministic policy evaluation</p></div><p className="mt-2 text-[10px] text-[var(--text-secondary)]">Evaluate deterministic governance rules against this persisted risk assessment.</p>{policyError && <p className="mt-2 text-[10px] text-[var(--critical)]">{policyError}</p>}</div>{policy ? <Link href={`/policies/${requestId}`} className="rounded-[7px] bg-white px-3 py-2 text-[10px] font-medium text-black">Open Policy Evaluation</Link> : <button type="button" onClick={() => void handleEvaluatePolicy()} disabled={evaluatingPolicy} className="rounded-[7px] bg-white px-3 py-2 text-[10px] font-medium text-black disabled:opacity-60">{evaluatingPolicy ? "Evaluating…" : "Evaluate Policy"}</button>}</div>
  </main></AppShell>;
}
