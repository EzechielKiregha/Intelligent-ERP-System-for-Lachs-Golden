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

  return (
    <div className="flex flex-col min-h-full">
      <div className="@container/main flex flex-1 flex-col gap-4">
        <ProjectScreen projectId={projectId} />
      </div>
    </div>

  );
}
