import { redirect } from "next/navigation";
import WorkspaceIdSettingClientPage from "./client";
import { useGetWorkspaceById } from "@/features/workspaces/api/use-get-workspace-by-id";

interface WorkspaceIdSettingPageProps {
  params: Promise<{
    workspaceId: string;
  }>;
}

export default async function WorkspaceIdSettingPage({
  params,
}: WorkspaceIdSettingPageProps) {
  const workspaceId = (await params).workspaceId;

  const workspace = useGetWorkspaceById(workspaceId);
  if (!workspace) {
    return redirect(`/workspaces/${workspaceId}`);
  }

  return <WorkspaceIdSettingClientPage />;
}
