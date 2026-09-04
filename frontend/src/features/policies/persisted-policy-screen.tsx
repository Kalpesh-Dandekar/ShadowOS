"use client";

import { AlertCircle, FileCheck2, LoaderCircle, Scale } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { AppShell } from "../../components/layout/app-shell";
import { useAuth } from "../../hooks/use-auth";
import { ApiError } from "../../services/api-client";
import { createApproval, getRequestApproval } from "../../services/approval-service";
import { getPolicyEvaluation } from "../../services/policy-service";
import { getRequest } from "../../services/request-service";
import { getRisk } from "../../services/risk-service";
import type { ApprovalRequest, ApprovalStatus } from "../../types/approval";
import type { PolicyDecision, PolicyEvaluation } from "../../types/policy";
import type { ShadowRequest } from "../../types/request";
import type { RiskAssessment } from "../../types/risk";

const decisionStyle: Record<PolicyDecision, string> = { ALLOW: "text-[var(--safe)] border-[rgb(93_211_158/0.3)]", REQUIRE_APPROVAL: "text-[var(--warning)] border-[rgb(231_183_91/0.3)]", BLOCK: "text-[var(--critical)] border-[rgb(239_98_98/0.3)]" };
const display = (value: string) => value.replaceAll("_", " ");
const policySummary = (decision: PolicyDecision) => decision === "ALLOW" ? "Allowed by deterministic governance policy." : decision === "BLOCK" ? "Blocked by deterministic governance policy." : "Human approval is required by deterministic governance policy.";
type ApprovalViewState = { kind: "NOT_APPLICABLE" | "LOADING" | "NONE" } | { kind: ApprovalStatus; approval: ApprovalRequest } | { kind: "ERROR"; message: string };
const persisted = (approval: ApprovalRequest): ApprovalViewState => ({ kind: approval.status, approval });

function presentation(policy: PolicyDecision, state: ApprovalViewState) {
  if (policy === "ALLOW") return { title: "Allowed by policy. No approval is required.", subtitle: "This request may continue to synthetic execution.", execute: true, request: false, approval: null };
  if (policy === "BLOCK") return { title: "Blocked by policy. Execution is not permitted.", subtitle: "This request cannot continue to approval or execution.", execute: false, request: false, approval: null };
  if (state.kind === "PENDING") return { title: "Approval is pending.", subtitle: "Human review is required before synthetic execution can continue.", execute: false, request: false, approval: state.approval };
  if (state.kind === "APPROVED") return { title: "Approval granted. This request may continue.", subtitle: "Persisted human approval: APPROVED.", execute: true, request: false, approval: state.approval };
  if (state.kind === "REJECTED") return { title: "Approval rejected. This request cannot continue.", subtitle: "Persisted human approval: REJECTED.", execute: false, request: false, approval: state.approval };
  if (state.kind === "NONE") return { title: "Approval is required before continuation.", subtitle: "No approval request has been created.", execute: false, request: true, approval: null };
  if (state.kind === "ERROR") return { title: "Approval status could not be loaded.", subtitle: "Retry or refresh before continuing.", execute: false, request: false, approval: null };
  return { title: "Approval is required before continuation.", subtitle: "Checking persisted approval status...", execute: false, request: false, approval: null };
}

export function PersistedPolicyScreen({ requestId }: { requestId: string }) {
  const { refreshSession } = useAuth();
  const [request, setRequest] = useState<ShadowRequest | null>(null), [risk, setRisk] = useState<RiskAssessment | null>(null), [evaluation, setEvaluation] = useState<PolicyEvaluation | null>(null);
  const [approvalState, setApprovalState] = useState<ApprovalViewState>({ kind: "NOT_APPLICABLE" });
  const [creating, setCreating] = useState(false), [error, setError] = useState("");
  useEffect(() => { let active = true; Promise.all([getRequest(requestId), getRisk(requestId), getPolicyEvaluation(requestId)]).then(async ([nextRequest, nextRisk, nextEvaluation]) => { if (!active) return; setRequest(nextRequest); setRisk(nextRisk); setEvaluation(nextEvaluation); if (nextEvaluation.decision !== "REQUIRE_APPROVAL") return; setApprovalState({ kind: "LOADING" }); try { const approval = await getRequestApproval(requestId); if (active) setApprovalState(persisted(approval)); } catch (caught) { if (!active) return; if (caught instanceof ApiError && caught.status === 404 && caught.code === "APPROVAL_NOT_FOUND") setApprovalState({ kind: "NONE" }); else setApprovalState({ kind: "ERROR", message: caught instanceof Error ? caught.message : "Unable to load approval state." }); } }).catch((caught: unknown) => { if (!active) return; if (caught instanceof ApiError && caught.status === 401) void refreshSession(); setError(caught instanceof ApiError ? caught.message : "Unable to load this policy evaluation."); }); return () => { active = false; }; }, [refreshSession, requestId]);
  async function requestApproval() { setCreating(true); try { setApprovalState(persisted(await createApproval(requestId))); } catch (caught) { setApprovalState({ kind: "ERROR", message: caught instanceof Error ? caught.message : "Unable to request approval." }); } finally { setCreating(false); } }
  if (error) return <AppShell pageTitle="Policy Engine"><main className="mx-auto max-w-4xl px-4 py-12"><div className="surface-panel rounded-[12px] border border-white/[0.08] p-6"><AlertCircle className="text-[var(--warning)]" /><h1 className="mt-4 text-xl font-semibold">Policy evaluation unavailable</h1><p className="mt-2 text-sm text-[var(--text-secondary)]">{error}</p><Link href={`/risk/${requestId}`} className="mt-6 inline-flex rounded-[7px] bg-white px-4 py-2 text-xs font-medium text-black">Return to Risk Engine</Link></div></main></AppShell>;
  if (!request || !risk || !evaluation) return <AppShell pageTitle="Policy Engine"><main className="grid min-h-[60vh] place-items-center"><LoaderCircle className="animate-spin text-[var(--intelligence)]" /></main></AppShell>;
  const approval = presentation(evaluation.decision, approvalState);
  return <AppShell pageTitle="Policy Engine"><main className="mx-auto max-w-[1450px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
    <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end"><div><p className="text-[10px] uppercase tracking-[0.18em] text-[var(--safe)]">Deterministic governance gate</p><h1 className="mt-2 text-3xl font-semibold">Policy Evaluation</h1><p className="mt-2 max-w-2xl text-sm text-[var(--text-secondary)]">Persisted rules evaluated against request, plan, simulation, and risk evidence.</p></div><div className={`rounded-[10px] border px-5 py-3 text-lg font-semibold ${decisionStyle[evaluation.decision]}`}>{display(evaluation.decision)}</div></div>
    <section className="surface-panel mt-7 rounded-[12px] border border-white/[0.08] p-5"><div className="flex gap-3"><FileCheck2 className="text-[var(--safe)]" size={19} /><div><p className="text-sm font-medium">{policySummary(evaluation.decision)}</p><p className="mt-2 text-[10px] text-[var(--text-secondary)]">Persisted policy result derived from immutable governance evidence.</p></div></div><dl className="mt-5 grid gap-px overflow-hidden rounded-[8px] border border-white/[0.07] bg-white/[0.07] sm:grid-cols-4">{[["Risk", `${risk.score} / ${risk.level}`], ["Rules evaluated", evaluation.evaluatedRuleCount], ["Rules matched", evaluation.matchedRuleCount], ["Environment", request.environment]].map(([label,value]) => <div className="bg-[var(--surface)] p-3" key={label}><dt className="text-[8px] uppercase text-[var(--text-muted)]">{label}</dt><dd className="mt-2 font-mono text-xs">{value}</dd></div>)}</dl></section>
    <section className="mt-5"><div className="flex items-center gap-2"><Scale size={16} className="text-[var(--intelligence)]" /><h2 className="text-sm font-medium">Matched policy rules</h2></div><div className="mt-4 space-y-3">{evaluation.matches.map((match) => <article key={match.id} className="surface-panel rounded-[10px] border border-white/[0.08] p-5"><div className="flex flex-wrap justify-between gap-3"><div><h3 className="text-sm font-medium">{match.ruleName}</h3><p className="mt-1 font-mono text-[9px] text-[var(--text-muted)]">{match.ruleKey} · PRIORITY {match.priority}</p></div><span className={`text-[10px] font-semibold ${decisionStyle[match.decision].split(" ")[0]}`}>{display(match.decision)}</span></div><p className="mt-4 text-xs text-[var(--text-secondary)]">{match.explanation}</p><pre className="mt-3 overflow-x-auto rounded-[7px] bg-black/25 p-3 text-[9px] text-[var(--text-muted)]">{JSON.stringify(match.observedFacts, null, 2)}</pre></article>)}</div></section>
    <section className="mt-5 flex flex-col justify-between gap-4 rounded-[10px] border border-[rgb(167_139_250/0.2)] bg-[rgb(167_139_250/0.04)] p-4 sm:flex-row sm:items-center"><div><p className="text-xs font-medium text-white">{approval.title}</p><p className="mt-1 text-[10px] text-[var(--text-secondary)]">{approval.subtitle}</p></div><div className="flex shrink-0 flex-wrap gap-2">{approval.execute&&<Link href={`/executions/${requestId}`} className="rounded-[7px] bg-white px-3 py-2 text-[10px] text-black">Execute Safely</Link>}{approval.request&&<button disabled={creating} onClick={() => void requestApproval()} className="rounded-[7px] bg-white px-3 py-2 text-[10px] text-black disabled:opacity-60">{creating ? "Requesting..." : "Request Approval"}</button>}{approval.approval&&<Link href={`/approvals/${approval.approval.id}`} className="rounded-[7px] border border-white/20 px-3 py-2 text-[10px]">Open Approval · {approval.approval.status}</Link>}</div></section>
  </main></AppShell>;
}
