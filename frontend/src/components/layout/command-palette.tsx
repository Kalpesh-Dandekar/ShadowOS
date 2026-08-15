"use client";

import { FileClock, ListChecks, Play, Search, ShieldAlert, TerminalSquare, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

const commands = [
  { label: "New AI Request", href: "/command-center", icon: TerminalSquare },
  { label: "Open Risk Engine", href: "/risk", icon: ShieldAlert },
  { label: "View Pending Approvals", href: "/approvals", icon: ListChecks },
  { label: "Search Audit Logs", href: "/audit", icon: FileClock },
  { label: "Open Policies", href: "/policies", icon: Search },
  { label: "View Executions", href: "/executions", icon: Play },
];

export function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  if (!open) return null;
  const filtered = commands.filter((command) => command.label.toLowerCase().includes(query.toLowerCase()));
  function navigate(href: string) { onClose(); router.push(href); }
  return <div className="fixed inset-0 z-[70] flex justify-center bg-black/70 px-4 pt-[15vh] backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Command palette" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <div className="h-fit w-full max-w-xl overflow-hidden rounded-[12px] border border-white/10 bg-[#101318] shadow-2xl">
      <div className="flex items-center gap-3 border-b border-white/[0.07] px-4"><Search size={17} className="text-[var(--text-muted)]" /><input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => { if (event.key === "Escape") onClose(); if (event.key === "Enter" && filtered[0]) navigate(filtered[0].href); }} placeholder="Search commands…" className="h-14 flex-1 bg-transparent text-sm outline-none placeholder:text-[var(--text-muted)]" aria-label="Search commands" /><button onClick={onClose} className="text-[var(--text-muted)] hover:text-white" aria-label="Close command palette"><X size={17} /></button></div>
      <div className="p-2"><p className="px-2 pb-2 pt-1 text-[9px] uppercase tracking-[0.16em] text-[var(--text-muted)]">Navigation</p>{filtered.map(({ label, href, icon: Icon }) => <button key={href} onClick={() => navigate(href)} className="flex w-full items-center gap-3 rounded-[7px] px-3 py-2.5 text-left text-sm text-[var(--text-secondary)] hover:bg-white/[0.055] hover:text-white"><Icon size={16} /><span>{label}</span><span className="ml-auto font-mono text-[9px] text-[var(--text-muted)]">OPEN</span></button>)}{filtered.length === 0 && <p className="px-3 py-8 text-center text-sm text-[var(--text-muted)]">No commands found.</p>}</div>
    </div>
  </div>;
}
