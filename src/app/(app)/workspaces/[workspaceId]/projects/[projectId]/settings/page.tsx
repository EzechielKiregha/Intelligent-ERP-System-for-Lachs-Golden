import { useGetProjectById } from "@/features/projects/api/use-get-projects";
import DeleteProjectSection from "@/features/projects/components/delete-project-section";
import EditProjectForm from "@/features/projects/components/edit-workspaces-form";
import { redirect } from "next/navigation";

interface ProjectIdSettingPageProps {
  params: Promise<{
    projectId: string;
    workspaceId: string;
  }>;
}

export default async function ProjectIdSettingPage({
  params,
}: ProjectIdSettingPageProps) {
  const projectId = (await params).projectId;
  const workspaceId = (await params).workspaceId;

  // TODO : Check do i need to validate member role for settings
  const { data: project } = useGetProjectById(projectId);

  if (!project) {
    return redirect(`/workspaces/${workspaceId}/projects/${projectId}`);
  }

  return (
    <div className="w-full mx-auto space-y-6">
      <EditProjectForm initialValue={project} />
      <DeleteProjectSection projectId={project.$id} />
    </div>
  );
}
