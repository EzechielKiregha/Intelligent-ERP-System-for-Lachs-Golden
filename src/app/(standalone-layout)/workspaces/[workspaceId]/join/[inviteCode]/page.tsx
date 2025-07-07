import PageNotFound from "@/components/page-not-found";
import { useGetWorkspaceById } from "@/features/workspaces/api/use-get-workspace-by-id";
import WorkspaceJoinScreen from "@/features/workspaces/components/workspace-join-screen";

interface WorkspaceJoinPageProps {
  params: Promise<{
    workspaceId: string;
  }>;
}

export default async function WorkspaceJoinPage({
  params,
}: WorkspaceJoinPageProps) {
  const workspaceId = (await params).workspaceId;
  const { data: workspace } = await useGetWorkspaceById(workspaceId);

  if (!workspace) {
    return <PageNotFound />;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <WorkspaceJoinScreen
        workspaceName={workspace?.name}
        workspaceId={workspace.$id}
      />
    </div>
  );
}
