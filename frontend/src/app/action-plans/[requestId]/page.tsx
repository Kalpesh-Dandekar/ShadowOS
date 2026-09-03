import { PersistedActionPlanScreen } from "../../../features/action-plans/persisted-action-plan-screen";

export default async function PersistedActionPlanPage({ params }: { params: Promise<{ requestId: string }> }) {
  const { requestId } = await params;
  return <PersistedActionPlanScreen requestId={requestId} />;
}
