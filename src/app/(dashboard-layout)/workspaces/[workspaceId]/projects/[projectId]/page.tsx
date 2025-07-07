import PageNotFound from "@/components/page-not-found";
import { useGetProjectById } from "@/features/projects/api/use-get-projects";
import ProjectScreen from "@/features/projects/components/project-screen";
import { useAuth } from "contents/authContext";
import { redirect } from "next/navigation";

interface ProjectIdPageProps {
  params: Promise<{
    projectId: string;
  }>;
}

export default async function ProjectIdPage({ params }: ProjectIdPageProps) {
  const { projectId } = await params;
  const user = await useAuth().user;

  if (!user) {
    return redirect("/login");
  }

  const { data: project } = await useGetProjectById(projectId);

  if (!project) {
    return <PageNotFound />;
  }

  return <ProjectScreen project={project} />;
}
