import { PersistedShadowWorkspaceScreen } from "../../../features/shadow-workspace/persisted-shadow-workspace-screen";

export default async function PersistedShadowWorkspacePage({ params }: { params: Promise<{ requestId: string }> }) {
  const { requestId } = await params;
  return <PersistedShadowWorkspaceScreen requestId={requestId} />;
}
