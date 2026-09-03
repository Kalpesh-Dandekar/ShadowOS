import { PersistedRiskScreen } from "../../../features/risk/persisted-risk-screen";

export default async function PersistedRiskPage({ params }: { params: Promise<{ requestId: string }> }) {
  const { requestId } = await params;
  return <PersistedRiskScreen requestId={requestId} />;
}
