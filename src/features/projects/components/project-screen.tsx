"use client";

import { Button } from "@/components/ui/button";
import ProjectAvatar from "./project-avatar";
import { Edit } from "lucide-react";
import Link from "next/link";
import { useGetWorkspaceIdParam } from "@/features/workspaces/hooks/use-get-workspace-param";
import TaskViewSwitcher from "@/features/tasks/components/task-view-switcher";
import { Card, CardContent } from "@/components/ui/card";
import { useGetProjectAnalytics } from "../api/use-get-project-analytics";
import { Skeleton } from "@/components/ui/skeleton";
import PageError from "@/components/page-error";
import AnalyticsContainer from "@/components/analysis-container";
import { Project } from "@/hooks/type";
import { useGetProjectById } from "../api/use-get-projects";

interface ProjectScreenProps {
  projectId: string;
}

export default function ProjectScreen({ projectId }: ProjectScreenProps) {

  const { data: project } = useGetProjectById(projectId);

  const workspaceId = useGetWorkspaceIdParam();
  const fullHref = `/workspaces/${workspaceId}/projects/${project?.id}`;
  const {
    data: projectAnalyticsData,
    isLoading: isLoadingProjectAnalyticsData,
  } = useGetProjectAnalytics(project?.id, workspaceId);

  if (!isLoadingProjectAnalyticsData && !projectAnalyticsData) {
    return <PageError />;
  }

  return (
    <div className="w-full mx-auto space-y-6 overflow-hidden">
      <div className="flex items-center justify-between gap-x-4">
        <ProjectAvatar imageUrl={project.images[0].url} name={project.name} />
        <Link href={`${fullHref}/settings`}>
          <Button variant={"outline"} className="bg-sidebar-accent">
            <Edit /> <span className="font-semibold">Edit</span>
          </Button>
        </Link>
      </div>
      {isLoadingProjectAnalyticsData ? (
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((number) => (
            <Skeleton key={number} className="w-full h-[100px] bg-sidebar rounded-lg" />
          ))}
        </div>
      ) : (
        projectAnalyticsData && (
          <AnalyticsContainer analyticsData={projectAnalyticsData} />
        )
      )}
      <Card className="bg-sidebar">
        <CardContent className="mt-4">
          <TaskViewSwitcher />
        </CardContent>
      </Card>
    </div>
  );
}
