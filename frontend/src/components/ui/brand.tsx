import { ShieldCheck } from "lucide-react";
import Link from "next/link";

type BrandProps = {
  compact?: boolean;
};

export function Brand({ compact = false }: BrandProps) {
  return (
    <Link href="/" className="inline-flex items-center gap-2.5" aria-label="ShadowOS home">
      <span className="grid size-8 place-items-center rounded-[7px] border border-white/10 bg-white/[0.04] text-[var(--safe)]">
        <ShieldCheck size={17} strokeWidth={1.8} />
      </span>
      {!compact && <span className="text-[15px] font-semibold tracking-[-0.02em]">ShadowOS</span>}
    </Link>
  );
}
