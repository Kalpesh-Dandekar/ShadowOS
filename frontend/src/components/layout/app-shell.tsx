"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";

import { CommandPalette } from "./command-palette";
import { Sidebar } from "./sidebar";
import { TopCommandBar } from "./top-command-bar";

export function AppShell({ children, pageTitle = "Governance Overview" }: { children: ReactNode; pageTitle?: string }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") { event.preventDefault(); setPaletteOpen((open) => !open); }
      if (event.key === "Escape") setPaletteOpen(false);
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);
  return <div className="min-h-screen bg-[linear-gradient(180deg,rgb(255_255_255/0.012),transparent_26rem)]">
    <Sidebar collapsed={collapsed} mobileOpen={mobileOpen} onCollapse={() => setCollapsed((value) => !value)} onCloseMobile={() => setMobileOpen(false)} />
    <div className={`transition-[padding] duration-200 ${collapsed ? "lg:pl-[72px]" : "lg:pl-[248px]"}`}><TopCommandBar pageTitle={pageTitle} onMenu={() => setMobileOpen(true)} onPalette={() => setPaletteOpen(true)} /><div className="page-enter">{children}</div></div>
    <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
  </div>;
}
