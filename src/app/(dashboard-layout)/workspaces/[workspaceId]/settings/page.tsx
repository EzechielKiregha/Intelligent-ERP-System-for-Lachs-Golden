"use client"
import { redirect } from "next/navigation";
import WorkspaceIdSettingClientPage from "./client";
import { useAuth } from "contents/authContext";
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

  const user = useAuth().user;
  if (!user) {
    return redirect("/login");
  }

  const workspace = await useGetWorkspaceById(workspaceId);
  if (!workspace) {
    return redirect(`/workspaces/${workspaceId}`);
  }

  return <WorkspaceIdSettingClientPage />;
}
