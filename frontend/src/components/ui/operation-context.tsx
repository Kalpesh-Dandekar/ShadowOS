import { Box, Clock3, Server, UserRound } from "lucide-react";

import type { OperationScenario } from "../../types/operation";

export function OperationContext({ scenario }: { scenario: OperationScenario }) {
  return <div className="flex flex-wrap gap-x-5 gap-y-2 text-[10px] text-[var(--text-muted)]">
    <span className="flex items-center gap-1.5 font-mono"><Box size={12} />{scenario.requestId}</span>
    <span className="flex items-center gap-1.5"><UserRound size={12} />{scenario.requestedBy}</span>
    <span className="flex items-center gap-1.5"><Server size={12} />{scenario.environment}</span>
    <span className="flex items-center gap-1.5"><Clock3 size={12} />{scenario.createdAt}</span>
  </div>;
}
