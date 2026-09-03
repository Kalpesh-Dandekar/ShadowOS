import { PersistedPolicyScreen } from "../../../features/policies/persisted-policy-screen";

export default async function PolicyEvaluationPage({ params }: { params: Promise<{ requestId: string }> }) { const { requestId } = await params; return <PersistedPolicyScreen requestId={requestId} />; }
