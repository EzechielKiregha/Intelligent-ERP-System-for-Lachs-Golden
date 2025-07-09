import PageNotFound from "@/components/page-not-found";
import { useGetProjectById } from "@/features/projects/api/use-get-projects";
import ProjectScreen from "@/features/projects/components/project-screen";


interface ProjectIdPageProps {
  params: Promise<{
    projectId: string;
  }>;
}

export default async function ProjectIdPage({ params }: ProjectIdPageProps) {
  const { projectId } = await params;

  return <ProjectScreen projectId={projectId} />;
}
