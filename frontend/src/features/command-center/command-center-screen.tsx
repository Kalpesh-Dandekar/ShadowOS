"use client";

import { AlertCircle, Check, CircleDot, Clock3, Database, FileClock, LoaderCircle, Plus, Server, ShieldAlert } from "lucide-react";
import { type FormEvent, useState } from "react";

import { AppShell } from "../../components/layout/app-shell";
import { useAuth } from "../../hooks/use-auth";
import { operationScenario } from "../../mock/command-center";
import { ApiError } from "../../services/api-client";
import { createRequest, listRequests } from "../../services/request-service";
import type { ShadowRequest } from "../../types/request";

function formatTimestamp(value: string) {
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function environmentLabel(value: string) {
  return value.charAt(0) + value.slice(1).toLowerCase();
}

function PreviewBoundary() {
  return <div className="mt-4 grid gap-4 lg:grid-cols-[0.8fr_1.2fr]"><section className="surface-panel rounded-[12px] border border-white/[0.08] bg-[var(--surface)] p-4 sm:p-5"><div className="flex items-start gap-3"><ShieldAlert size={16} className="mt-0.5 shrink-0 text-[var(--warning)]" /><div><h2 className="text-sm font-medium">Planning is not connected</h2><p className="mt-2 text-[10px] leading-5 text-[var(--text-secondary)]">Phase 3A records the root request only. Gemini, structured actions, simulation, risk, policy, approvals, and execution remain unavailable.</p></div></div><div className="mt-5 flex items-center gap-3 border-y border-white/[0.06] py-4"><span className="grid size-7 place-items-center rounded-full border border-[rgb(167_139_250/0.25)] text-[var(--intelligence)]"><CircleDot size={13} /></span><div><p className="text-xs text-[var(--text-secondary)]">Submit a request to establish its identity</p><p className="mt-1 font-mono text-[8px] text-[var(--text-muted)]">PERSISTENCE FIRST · PLANNING LATER</p></div></div></section><section className="surface-panel rounded-[12px] border border-white/[0.08] bg-[var(--surface)] p-4 sm:p-5"><p className="text-[9px] font-medium uppercase tracking-[0.15em] text-[var(--warning)]">Phase 1 sample boundary</p><h2 className="mt-2 text-sm font-medium">REQ-8F2A remains preview-only</h2><p className="mt-2 text-[10px] leading-5 text-[var(--text-secondary)]">The existing plan example is not linked to new persisted requests. Action Plans remains a deterministic interface preview until Phase 3B.</p><dl className="mt-5 grid gap-px overflow-hidden rounded-[8px] border border-white/[0.06] bg-white/[0.06] sm:grid-cols-3">{[["Sample actions", "3"], ["Sample resources", "143"], ["Sample risk", "HIGH · 72"]].map(([label, value]) => <div key={label} className="bg-[var(--surface)] p-3"><dt className="text-[8px] text-[var(--text-muted)]">{label}</dt><dd className="mt-2 font-mono text-[10px] text-[var(--text-secondary)]">{value}</dd></div>)}</dl></section></div>;
}

function PersistedContext({ request }: { request: ShadowRequest }) {
  return <div className="mt-4 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]"><section className="surface-panel rounded-[12px] border border-[rgb(93_211_158/0.18)] bg-[var(--surface)] p-4 sm:p-5"><div className="flex items-start gap-3"><span className="grid size-9 shrink-0 place-items-center rounded-[8px] bg-[rgb(93_211_158/0.08)] text-[var(--safe)]"><Check size={16} /></span><div><p className="text-xs font-medium text-[var(--safe)]">Request recorded</p><p className="mt-1 text-[10px] text-[var(--text-secondary)]">Persisted successfully and ready for the future planning phase.</p></div></div><dl className="mt-5 grid gap-px overflow-hidden rounded-[8px] border border-white/[0.06] bg-white/[0.06] sm:grid-cols-2"><div className="bg-[var(--surface)] p-3"><dt className="text-[8px] uppercase tracking-wider text-[var(--text-muted)]">Request ID</dt><dd className="mt-2 break-all font-mono text-[9px] text-white">{request.id}</dd></div><div className="bg-[var(--surface)] p-3"><dt className="text-[8px] uppercase tracking-wider text-[var(--text-muted)]">Status</dt><dd className="mt-2 font-mono text-[10px] text-[var(--safe)]">{request.status}</dd></div><div className="bg-[var(--surface)] p-3"><dt className="text-[8px] uppercase tracking-wider text-[var(--text-muted)]">Environment</dt><dd className="mt-2 flex items-center gap-1.5 text-[10px] text-[var(--text-secondary)]"><Server size={11} />{environmentLabel(request.environment)}</dd></div><div className="bg-[var(--surface)] p-3"><dt className="text-[8px] uppercase tracking-wider text-[var(--text-muted)]">Created</dt><dd className="mt-2 flex items-center gap-1.5 text-[10px] text-[var(--text-secondary)]"><Clock3 size={11} />{formatTimestamp(request.createdAt)}</dd></div></dl></section><section className="surface-panel rounded-[12px] border border-white/[0.08] bg-[var(--surface)] p-4 sm:p-5"><p className="text-xs font-medium">Accurate lifecycle state</p><p className="mt-2 text-[10px] leading-5 text-[var(--text-muted)]">No plan has been generated for this request. Phase 3B will introduce planning deliberately.</p><div className="mt-5 flex items-center gap-3 border-y border-white/[0.06] py-4"><span className="grid size-7 place-items-center rounded-full border border-[rgb(167_139_250/0.25)] text-[var(--intelligence)]"><CircleDot size={13} /></span><div><p className="text-xs text-[var(--text-secondary)]">Ready for planning</p><p className="mt-1 font-mono text-[8px] text-[var(--text-muted)]">NOT STARTED</p></div></div></section></div>;
}

export function CommandCenterScreen() {
  const { refreshSession } = useAuth();
  const [prompt, setPrompt] = useState(operationScenario.request);
  const [submittedRequest, setSubmittedRequest] = useState<ShadowRequest | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [historyOpen, setHistoryOpen] = useState(false);
  const [history, setHistory] = useState<ShadowRequest[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  function handleApiFailure(caught: unknown, fallback: string) {
    if (caught instanceof ApiError && caught.status === 401) void refreshSession();
    setError(caught instanceof ApiError ? caught.message : fallback);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError("");
    try {
      const created = await createRequest({ prompt: prompt.trim(), environment: "PRODUCTION" });
      setSubmittedRequest(created);
      setPrompt(created.prompt);
      if (historyOpen) setHistory((current) => [created, ...current.filter((item) => item.id !== created.id)].slice(0, 5));
    } catch (caught) {
      handleApiFailure(caught, "Unable to record the request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleHistory() {
    if (historyOpen) { setHistoryOpen(false); return; }
    setHistoryOpen(true);
    setHistoryLoading(true);
    setError("");
    try {
      setHistory((await listRequests(1, 5)).requests);
    } catch (caught) {
      handleApiFailure(caught, "Unable to load request history.");
    } finally {
      setHistoryLoading(false);
    }
  }

  function reset() {
    setPrompt("");
    setSubmittedRequest(null);
    setError("");
  }

  return <AppShell pageTitle="AI Command Center"><main className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8"><div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end"><div><p className="text-[10px] font-medium uppercase tracking-[0.18em] text-[var(--intelligence)]">AI operations / intake</p><h1 className="mt-2 text-3xl font-semibold tracking-[-0.035em]">AI Command Center</h1><p className="mt-2 max-w-2xl text-sm text-[var(--text-secondary)]">Record an operational request as the governed root for future planning and review.</p></div><div className="flex gap-2"><button type="button" onClick={() => void toggleHistory()} className="flex items-center gap-2 rounded-[7px] border border-white/[0.08] px-3 py-2 text-xs text-[var(--text-secondary)] hover:bg-white/[0.04]"><FileClock size={14} />History</button><button type="button" onClick={reset} className="flex items-center gap-2 rounded-[7px] bg-white px-3 py-2 text-xs font-medium text-black hover:bg-zinc-200"><Plus size={14} />New request</button></div></div>

    {historyOpen && <section className="surface-panel mt-4 rounded-[10px] border border-white/[0.08] bg-[var(--surface)] p-4"><div className="flex items-center justify-between"><div><h2 className="text-xs font-medium">Recent persisted requests</h2><p className="mt-1 text-[9px] text-[var(--text-muted)]">Your five newest requests</p></div><span className="font-mono text-[8px] text-[var(--text-muted)]">OWNER SCOPED</span></div>{historyLoading ? <div className="mt-4 h-12 animate-pulse rounded-[7px] bg-white/[0.025]" /> : history.length === 0 ? <p className="mt-4 border-t border-white/[0.06] pt-4 text-[10px] text-[var(--text-muted)]">No persisted requests yet.</p> : <div className="mt-4 divide-y divide-white/[0.055] border-t border-white/[0.055]">{history.map((item) => <button key={item.id} type="button" onClick={() => { setSubmittedRequest(item); setPrompt(item.prompt); }} className="grid w-full gap-2 py-3 text-left hover:bg-white/[0.012] sm:grid-cols-[1fr_auto]"><div className="min-w-0"><p className="truncate text-xs text-[var(--text-secondary)]">{item.prompt}</p><p className="mt-1 truncate font-mono text-[8px] text-[var(--text-muted)]">{item.id}</p></div><span className="font-mono text-[8px] text-[var(--text-muted)]">{item.status} · {formatTimestamp(item.createdAt)}</span></button>)}</div>}</section>}

    <section className="surface-panel mt-7 overflow-hidden rounded-[12px] border border-white/[0.09] bg-[var(--surface)] shadow-[var(--shadow-panel)]"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.07] bg-white/[0.012] px-4 py-3 sm:px-5"><div className="flex items-center gap-3 text-xs"><span className="size-1.5 rounded-full bg-[var(--warning)]" /><span className="text-[var(--text-secondary)]">Production environment</span><span className="hidden font-mono text-[9px] uppercase tracking-[0.12em] text-[var(--text-muted)] sm:inline">Governed intake channel</span></div><span className="max-w-full truncate font-mono text-[9px] text-[var(--text-muted)]">{submittedRequest ? `REQUEST / ${submittedRequest.id}` : "REQUEST / NOT YET RECORDED"}</span></div><form onSubmit={handleSubmit} className="p-4 sm:p-6"><div><label htmlFor="operation-request" className="text-[10px] font-medium uppercase tracking-[0.15em] text-[var(--text-muted)]">Operational intent</label><p className="mt-1 text-[10px] text-[var(--text-muted)]">This records the request only. Planning and execution are not performed in Phase 3A.</p></div><textarea id="operation-request" value={prompt} onChange={(event) => setPrompt(event.target.value)} disabled={submitting} required minLength={10} maxLength={2000} className="mt-4 min-h-28 w-full resize-none border-0 bg-transparent text-xl leading-8 tracking-[-0.02em] text-white outline-none placeholder:text-[var(--text-muted)] disabled:opacity-60 sm:text-2xl" placeholder="Describe the operation to govern…" />{error && <div role="alert" className="mt-3 flex items-center gap-2 text-[10px] text-[var(--critical)]"><AlertCircle size={13} />{error}</div>}<div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.06] pt-4"><div className="flex flex-wrap gap-2"><span className="rounded-[5px] border border-white/[0.08] bg-white/[0.025] px-2.5 py-1.5 font-mono text-[9px] text-[var(--text-muted)]">ENV / PRODUCTION</span><span className="rounded-[5px] border border-white/[0.08] bg-white/[0.025] px-2.5 py-1.5 font-mono text-[9px] text-[var(--text-muted)]">MODE / PERSIST_ONLY</span><span className="rounded-[5px] border border-white/[0.08] bg-white/[0.025] px-2.5 py-1.5 font-mono text-[9px] text-[var(--text-muted)]">AI / NOT_CONNECTED</span></div><button type="submit" disabled={submitting || prompt.trim().length < 10} className="flex min-w-32 items-center justify-center gap-2 rounded-[7px] border border-[rgb(167_139_250/0.3)] bg-[rgb(167_139_250/0.08)] px-3.5 py-2 text-xs font-medium text-[var(--intelligence)] hover:bg-[rgb(167_139_250/0.12)] disabled:cursor-not-allowed disabled:opacity-50">{submitting ? <LoaderCircle size={14} className="animate-spin" /> : <Database size={14} />}{submitting ? "Recording" : "Record request"}</button></div></form></section>

    {submittedRequest ? <PersistedContext request={submittedRequest} /> : <PreviewBoundary />}
  </main></AppShell>;
}
