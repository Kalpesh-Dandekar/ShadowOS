"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";

import { AuthGuard } from "../../features/auth/auth-guard";
import { useAuth } from "../../hooks/use-auth";
import { CommandPalette } from "./command-palette";
import { Sidebar } from "./sidebar";
import { TopCommandBar } from "./top-command-bar";

export function AppShell({ children, pageTitle = "Governance Overview" }: { children: ReactNode; pageTitle?: string }) {
  const { user } = useAuth();
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
  return <AuthGuard>{user && <div className="min-h-screen bg-[linear-gradient(180deg,rgb(255_255_255/0.012),transparent_26rem)]">
    <Sidebar user={user} collapsed={collapsed} mobileOpen={mobileOpen} onCollapse={() => setCollapsed((value) => !value)} onCloseMobile={() => setMobileOpen(false)} />
    <div className={`transition-[padding] duration-200 ${collapsed ? "lg:pl-[72px]" : "lg:pl-[248px]"}`}><TopCommandBar user={user} pageTitle={pageTitle} onMenu={() => setMobileOpen(true)} onPalette={() => setPaletteOpen(true)} /><div className="page-enter">{children}</div></div>
    <CommandPalette role={user.role} open={paletteOpen} onClose={() => setPaletteOpen(false)} />
  </div>}</AuthGuard>;
}
