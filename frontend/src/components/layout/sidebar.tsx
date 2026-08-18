"use client";

import { Activity, BarChart3, Bell, Blocks, BookOpenCheck, Bot, ChevronLeft, ClipboardCheck, FileClock, Gauge, ListChecks, Settings, ShieldAlert, TerminalSquare, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Brand } from "../ui/brand";

const groups = [
  { label: "Overview", items: [["Dashboard", "/dashboard", Gauge]] },
  { label: "AI Operations", items: [["Command Center", "/command-center", TerminalSquare], ["Action Plans", "/action-plans", ListChecks], ["Shadow Workspace", "/shadow-workspace", Blocks]] },
  { label: "Governance", items: [["Risk Engine", "/risk", ShieldAlert], ["Policies", "/policies", BookOpenCheck], ["Approvals", "/approvals", ClipboardCheck]] },
  { label: "Operations", items: [["Executions", "/executions", Bot], ["Audit Logs", "/audit", FileClock]] },
  { label: "Insights", items: [["Analytics", "/analytics", BarChart3], ["Activity", "/activity", Activity]] },
  { label: "System", items: [["Notifications", "/notifications", Bell], ["Settings", "/settings", Settings]] },
] as const;

type SidebarProps = { collapsed: boolean; mobileOpen: boolean; onCollapse: () => void; onCloseMobile: () => void };

export function Sidebar({ collapsed, mobileOpen, onCollapse, onCloseMobile }: SidebarProps) {
  const pathname = usePathname();
  return (
    <>
      {mobileOpen && <button className="fixed inset-0 z-40 bg-black/70 lg:hidden" onClick={onCloseMobile} aria-label="Close navigation" />}
      <aside className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r border-white/[0.07] bg-[#090b0e] shadow-[12px_0_40px_rgb(0_0_0/0.08)] transition-[width,transform] duration-200 ${collapsed ? "w-[72px]" : "w-[248px]"} ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        <div className={`flex h-16 items-center border-b border-white/[0.06] ${collapsed ? "justify-center" : "justify-between px-4"}`}>
          <Brand compact={collapsed} />
          {!collapsed && <button className="hidden p-1.5 text-[var(--text-muted)] hover:text-white lg:block" onClick={onCollapse} aria-label="Collapse sidebar"><ChevronLeft size={17} /></button>}
          <button className="p-1.5 text-[var(--text-muted)] hover:text-white lg:hidden" onClick={onCloseMobile} aria-label="Close sidebar"><X size={18} /></button>
        </div>
        <nav className="flex-1 overflow-y-auto px-2 py-4" aria-label="Application navigation">
          {groups.map((group) => <div key={group.label} className="mb-4">
            {!collapsed && <p className="mb-1.5 px-2 text-[9px] font-medium uppercase tracking-[0.16em] text-[var(--text-muted)]">{group.label}</p>}
            <div className="space-y-0.5">{group.items.map(([label, href, Icon]) => {
              const active = pathname === href;
              return <Link key={href} href={href} title={collapsed ? label : undefined} onClick={onCloseMobile} className={`relative flex h-9 items-center rounded-[6px] text-[13px] transition-colors ${collapsed ? "justify-center" : "gap-3 px-2.5"} ${active ? "bg-white/[0.06] text-white shadow-[inset_0_1px_rgb(255_255_255/0.025)]" : "text-[var(--text-muted)] hover:bg-white/[0.035] hover:text-[var(--text-secondary)]"}`}>
                {active && <span className="absolute left-0 h-4 w-0.5 rounded-full bg-[var(--info)]" />}<Icon size={16} strokeWidth={1.8} />{!collapsed && <span>{label}</span>}
              </Link>;
            })}</div>
          </div>)}
        </nav>
        <div className="border-t border-white/[0.06] p-3">
          <div className={`mb-3 flex items-center ${collapsed ? "justify-center" : "gap-2"}`}><span className="size-1.5 rounded-full bg-[var(--info)] shadow-[0_0_8px_var(--info)]" />{!collapsed && <span className="text-[10px] text-[var(--text-muted)]">Preview environment</span>}</div>
          <div className={`flex items-center ${collapsed ? "justify-center" : "gap-3"}`}><span className="grid size-8 shrink-0 place-items-center rounded-[7px] bg-white/[0.07] text-xs font-semibold">KD</span>{!collapsed && <div className="min-w-0"><p className="truncate text-xs font-medium">Kalpesh Dandekar</p><p className="text-[10px] text-[var(--text-muted)]">Administrator</p></div>}</div>
        </div>
        {collapsed && <button onClick={onCollapse} className="absolute -right-3 top-[27px] hidden size-6 place-items-center rounded-full border border-white/10 bg-[var(--surface-elevated)] text-[var(--text-muted)] hover:text-white lg:grid" aria-label="Expand sidebar"><ChevronLeft size={13} className="rotate-180" /></button>}
      </aside>
    </>
  );
}
