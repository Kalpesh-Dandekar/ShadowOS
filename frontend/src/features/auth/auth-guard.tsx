"use client";

import { useRouter } from "next/navigation";
import { type ReactNode, useEffect } from "react";

import { useAuth } from "../../hooks/use-auth";

function LoadingState() {
  return <main className="grid min-h-screen place-items-center bg-[var(--background)]" aria-busy="true"><p className="text-sm text-[var(--text-muted)]">Restoring secure sessionâ€¦</p></main>;
}

export function AuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { status, sessionError, refreshSession } = useAuth();

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/login");
  }, [router, status]);

  if (status === "loading" || status === "unauthenticated") return <LoadingState />;
  if (status === "error") {
    return <main className="grid min-h-screen place-items-center bg-[var(--background)] px-5"><div className="max-w-md text-center"><h1 className="text-xl font-semibold">Unable to restore your session</h1><p className="mt-3 text-sm text-[var(--text-secondary)]">{sessionError}</p><button onClick={() => void refreshSession()} className="mt-5 rounded-[8px] bg-white px-4 py-2.5 text-sm font-medium text-black">Try again</button></div></main>;
  }
  return children;
}

export function PublicAuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { status } = useAuth();

  useEffect(() => {
    if (status === "authenticated") router.replace("/dashboard");
  }, [router, status]);

  if (status === "loading" || status === "authenticated") return <LoadingState />;
  return children;
}
