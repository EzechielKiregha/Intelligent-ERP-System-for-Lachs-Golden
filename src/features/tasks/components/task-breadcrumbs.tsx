
import ProjectAvatar from "@/features/projects/components/project-avatar";
import { ChevronRight, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useDeleteTask } from "../api/use-delete-task";
import useConfirmDialog from "@/hooks/use-confirm-dialog";
import { toast } from "sonner";
import { useOpenEditTaskModal } from "../hooks/use-open-edit-task-modal";
import EditTaskModal from "./edit-task-modal";
import { useRouter } from "next/navigation";
import { Project, Task } from "@/hooks/type";

interface TaskBreadcrumbsProps {
  task: Task;
}

export default function TaskBreadcrumbs({
  task,
}: TaskBreadcrumbsProps) {
  const router = useRouter();
  const { setIsOpen: setOpenEditTaskModal } = useOpenEditTaskModal();
  const [DeleteConfirmDialog, deleteConfirm] = useConfirmDialog(
    "Are you sure?",
    "This process cannot be undo"
  );

  // console.log("[Task Breadcrumbs] Task:", task);

  const { mutate: deleteMutation } = useDeleteTask(task.workspaceId);

  const handleDelete = async () => {
    const ok = await deleteConfirm();

    if (!ok) {
      return;
    }
    const taskId = task.id
    deleteMutation(
      taskId,
      {
        onSuccess: ({ message }) => {
          toast.success(message);
          router.push(`/workspaces/${task.workspaceId}/tasks`);
        },
        onError: ({ message }) => {
          toast.error(message);
        },
      }
    );
  };

  return (
    <>
      <EditTaskModal />
      <DeleteConfirmDialog />
      <div className="flex items-center justify-between gap-x-4">
        <div className="flex items-center gap-x-1">
          <Link
            href={`/workspaces/${task.workspaceId}/projects/${task.projectId}`}
            className="group "
          >
            <ProjectAvatar
              name={task.project.name}
              imageUrl={task.project.images[0]?.url}
              className="size-8"
              textClassName="text-[14px] text-muted-foreground group-hover:text-black transition-colors"
            />
          </Link>
          <div className="flex items-center gap-x-1">
            <ChevronRight className="size-5 lg:size-6 text-muted-foreground" />
            <span className="font-bold text-sm lg:text-base truncate">
              {task.title}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-x-2">
          <Button
            variant={"outline"}
            size={"sm"}
            onClick={() => {
              setOpenEditTaskModal({
                editTaskForm: true,
                taskId: task.id,
              });
            }}
          >
            <Pencil />
            <span className="text-sm font-bold hidden lg:block">Edit</span>
          </Button>
          <Button variant={"destructive"} size={"sm"} onClick={handleDelete}>
            <Trash2 />
            <span className="text-sm font-bold hidden lg:block">Delete</span>
          </Button>
        </div>
      </div>
    </>
  );
}
