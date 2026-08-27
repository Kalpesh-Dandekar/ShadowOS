"use client";

import { Check, Clock3, RefreshCw, ShieldCheck, UserRound, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { ApiError } from "../../services/api-client";
import { approveRoleRequest, listPendingRoleRequests, rejectRoleRequest } from "../../services/role-request-service";
import type { RoleRequest } from "../../types/role-request";

type ReviewAction = { kind: "approve" | "reject"; request: RoleRequest } | null;

function initials(name: string) {
  return name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "SO";
}

function requestedDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value));
}

function safeMessage(error: unknown) {
  return error instanceof ApiError ? error.message : "The request could not be completed. Please try again.";
}

function ReviewDialog({ action, busy, onClose, onConfirm }: { action: NonNullable<ReviewAction>; busy: boolean; onClose: () => void; onConfirm: (comment?: string) => void }) {
  const [comment, setComment] = useState("");
  const approving = action.kind === "approve";
  return <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 px-4 backdrop-blur-sm" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !busy) onClose(); }}><section role="dialog" aria-modal="true" aria-labelledby="role-review-title" className="w-full max-w-md overflow-hidden rounded-[12px] border border-white/[0.1] bg-[#111317] shadow-2xl"><div className="flex items-start gap-3 border-b border-white/[0.07] p-5"><span className={`grid size-9 shrink-0 place-items-center rounded-[8px] ${approving ? "bg-[rgb(93_211_158/0.1)] text-[var(--safe)]" : "bg-[rgb(244_114_114/0.1)] text-[var(--critical)]"}`}>{approving ? <ShieldCheck size={17} /> : <X size={17} />}</span><div><h3 id="role-review-title" className="text-sm font-semibold">{approving ? "Approve Manager Access?" : "Reject Manager Request"}</h3><p className="mt-1 text-[10px] leading-5 text-[var(--text-secondary)]">{approving ? `This will grant ${action.request.user.name} Manager privileges, including access to approval workflows.` : `Decline the Manager access request from ${action.request.user.name}. You can optionally include a reason.`}</p></div></div>{!approving && <div className="px-5 pt-4"><label htmlFor="review-comment" className="text-[9px] font-medium uppercase tracking-[0.14em] text-[var(--text-muted)]">Review comment · optional</label><textarea id="review-comment" value={comment} maxLength={500} onChange={(event) => setComment(event.target.value)} disabled={busy} placeholder="Add a brief reason for the decision" className="mt-2 min-h-20 w-full resize-none rounded-[7px] border border-white/[0.09] bg-black/20 px-3 py-2.5 text-xs text-white outline-none placeholder:text-[var(--text-muted)] focus:border-[var(--focus)] focus:ring-2 focus:ring-[rgb(106_168_255/0.1)]" /></div>}<div className="flex justify-end gap-2 p-5"><button type="button" disabled={busy} onClick={onClose} className="rounded-[7px] border border-white/[0.09] px-3 py-2 text-xs text-[var(--text-secondary)] hover:bg-white/[0.04] disabled:opacity-50">Cancel</button><button type="button" disabled={busy} onClick={() => onConfirm(comment.trim() || undefined)} className={`flex min-w-28 items-center justify-center gap-2 rounded-[7px] px-3 py-2 text-xs font-medium disabled:cursor-wait disabled:opacity-60 ${approving ? "bg-white text-black hover:bg-zinc-200" : "bg-[var(--critical)] text-black hover:brightness-110"}`}>{busy && <RefreshCw size={13} className="animate-spin" />}{busy ? "Processing" : approving ? "Approve Access" : "Reject Request"}</button></div></section></div>;
}

export function AccessRolesSection() {
  const [requests, setRequests] = useState<RoleRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");
  const [reviewAction, setReviewAction] = useState<ReviewAction>(null);
  const [busy, setBusy] = useState(false);

  const loadRequests = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setRequests(await listPendingRoleRequests());
    } catch (caught) {
      setError(safeMessage(caught));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    listPendingRoleRequests()
      .then((pendingRequests) => { if (active) setRequests(pendingRequests); })
      .catch((caught: unknown) => { if (active) setError(safeMessage(caught)); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  async function review(comment?: string) {
    if (!reviewAction || busy) return;
    setBusy(true);
    setError("");
    try {
      if (reviewAction.kind === "approve") await approveRoleRequest(reviewAction.request.id);
      else await rejectRoleRequest(reviewAction.request.id, comment);
      setRequests((current) => current.filter((item) => item.id !== reviewAction.request.id));
      setFeedback(reviewAction.kind === "approve" ? "Manager access approved." : "Manager request rejected.");
      setReviewAction(null);
    } catch (caught) {
      setError(safeMessage(caught));
      setReviewAction(null);
    } finally {
      setBusy(false);
    }
  }

  return <div className="py-5"><div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end"><div><p className="text-[10px] font-medium uppercase tracking-[0.16em] text-[var(--info)]">Identity governance</p><h3 className="mt-2 text-base font-semibold">Manager Access Requests</h3><p className="mt-1 text-[10px] leading-5 text-[var(--text-secondary)]">Review users requesting elevated approval capabilities.</p></div>{!loading && <span className="w-fit rounded-full border border-white/[0.08] bg-white/[0.035] px-2.5 py-1 font-mono text-[9px] text-[var(--text-muted)]">{requests.length} pending</span>}</div>
    {feedback && <div className="mt-4 flex items-center gap-2 rounded-[7px] border border-[rgb(93_211_158/0.2)] bg-[rgb(93_211_158/0.055)] px-3 py-2.5 text-[10px] text-[var(--safe)]" role="status"><Check size={13} />{feedback}</div>}
    {error && <div className="mt-4 flex items-center justify-between gap-3 rounded-[7px] border border-[rgb(244_114_114/0.2)] bg-[rgb(244_114_114/0.045)] px-3 py-2.5"><p className="text-[10px] text-[var(--critical)]">{error}</p><button type="button" onClick={() => void loadRequests()} className="flex shrink-0 items-center gap-1.5 text-[10px] text-[var(--text-secondary)] hover:text-white"><RefreshCw size={12} />Retry</button></div>}
    {loading ? <div className="mt-5 space-y-2" aria-label="Loading access requests">{[0, 1].map((item) => <div key={item} className="h-[82px] animate-pulse rounded-[8px] border border-white/[0.05] bg-white/[0.018]" />)}</div> : requests.length === 0 ? <div className="mt-5 flex items-center gap-4 rounded-[8px] border border-dashed border-white/[0.09] px-4 py-5"><span className="grid size-9 shrink-0 place-items-center rounded-full bg-white/[0.035] text-[var(--text-muted)]"><UserRound size={16} /></span><div><p className="text-xs font-medium text-[var(--text-secondary)]">No pending access requests</p><p className="mt-1 text-[9px] leading-4 text-[var(--text-muted)]">Manager access requests will appear here when users request elevated permissions.</p></div></div> : <div className="mt-5 divide-y divide-white/[0.06] border-y border-white/[0.06]">{requests.map((request) => <article key={request.id} className="grid gap-4 py-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center"><div className="flex min-w-0 items-center gap-3"><span className="grid size-10 shrink-0 place-items-center rounded-[9px] border border-white/[0.07] bg-white/[0.035] text-xs font-semibold text-[var(--text-secondary)]">{initials(request.user.name)}</span><div className="min-w-0"><p className="truncate text-xs font-medium">{request.user.name}</p><p className="mt-1 truncate font-mono text-[9px] text-[var(--text-muted)]">{request.user.email}</p><div className="mt-2 flex flex-wrap items-center gap-2 text-[8px] text-[var(--text-muted)]"><span className="rounded-full border border-[rgb(231_183_91/0.2)] bg-[rgb(231_183_91/0.06)] px-2 py-0.5 font-medium uppercase tracking-wide text-[var(--warning)]">Pending</span><span>Employee → Manager</span><span className="flex items-center gap-1"><Clock3 size={10} />{requestedDate(request.createdAt)}</span></div></div></div><div className="flex gap-2 lg:justify-end"><button type="button" disabled={busy} onClick={() => { setFeedback(""); setReviewAction({ kind: "reject", request }); }} className="rounded-[7px] border border-white/[0.09] px-3 py-2 text-xs text-[var(--text-secondary)] hover:border-[rgb(244_114_114/0.2)] hover:bg-[rgb(244_114_114/0.045)] hover:text-[var(--critical)] disabled:opacity-50">Reject</button><button type="button" disabled={busy} onClick={() => { setFeedback(""); setReviewAction({ kind: "approve", request }); }} className="rounded-[7px] bg-white px-3 py-2 text-xs font-medium text-black hover:bg-zinc-200 disabled:opacity-50">Approve</button></div></article>)}</div>}
    <div className="mt-5 flex items-start gap-2 border-t border-white/[0.05] pt-4 text-[9px] leading-4 text-[var(--text-muted)]"><ShieldCheck size={13} className="mt-0.5 shrink-0" />Approval grants Manager privileges immediately. Authorization is enforced by the backend using the user&apos;s current database role.</div>
    {reviewAction && <ReviewDialog action={reviewAction} busy={busy} onClose={() => setReviewAction(null)} onConfirm={(comment) => void review(comment)} />}
  </div>;
}
