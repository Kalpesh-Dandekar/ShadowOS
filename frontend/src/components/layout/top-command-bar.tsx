"use client";

import { Bell, Menu, Search } from "lucide-react";

export function TopCommandBar({ pageTitle, onMenu, onPalette }: { pageTitle: string; onMenu: () => void; onPalette: () => void }) {
  return <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-white/[0.07] bg-[#08090bf0] px-4 backdrop-blur-xl sm:px-6">
    <button onClick={onMenu} className="p-1.5 text-[var(--text-muted)] hover:text-white lg:hidden" aria-label="Open navigation"><Menu size={19} /></button>
    <div className="hidden items-center gap-2 text-xs sm:flex"><span className="text-[var(--text-muted)]">ShadowOS</span><span className="text-[var(--border-strong)]">/</span><span className="text-[var(--text-secondary)]">{pageTitle}</span></div>
    <button onClick={onPalette} className="ml-auto flex h-9 w-full max-w-[320px] items-center gap-2 rounded-[7px] border border-white/[0.09] bg-white/[0.025] px-3 text-xs text-[var(--text-muted)] shadow-[inset_0_1px_rgb(255_255_255/0.02)] hover:border-white/15 hover:bg-white/[0.04] sm:ml-auto"><Search size={14} /><span className="truncate">Search commands</span><kbd className="ml-auto hidden rounded border border-white/10 bg-white/[0.04] px-1.5 py-0.5 font-mono text-[9px] md:block">⌘ K</kbd></button>
    <div className="hidden items-center gap-2 text-[10px] text-[var(--text-muted)] xl:flex"><span className="size-1.5 rounded-full bg-[var(--safe)]" />All systems nominal</div>
    <button className="relative p-2 text-[var(--text-muted)] hover:text-white" aria-label="Notifications"><Bell size={17} /><span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-[var(--warning)]" /></button>
    <button className="grid size-8 place-items-center rounded-[7px] border border-white/10 bg-white/[0.04] text-[10px] font-semibold" aria-label="Open profile menu">KD</button>
  </header>;
}
