
import { Badge } from "@/components/ui/badge";
import MemberAvatar from "@/features/members/components/member-avatar";
import TaskDate from "@/features/tasks/components/task-date";
import { formatEnumCase } from "@/lib/utils";
import TaskOverviewProperty from "@/features/tasks/components/task-overview-property";
import { Task } from "@/hooks/type";

interface TaskOverviewCardProps {
  task: Task;
}

export default function TaskOverviewCard({ task }: TaskOverviewCardProps) {
  return (
    <div className="p-4 rounded-lg border">
      <span className="text-lg font-bold">Overview</span>
      <div className="space-y-3 mt-4">
        <TaskOverviewProperty label="Name">
          <p>{task.title}</p>
        </TaskOverviewProperty>
        <TaskOverviewProperty label="Description">
          <p>{task.description || "No description set"}</p>
        </TaskOverviewProperty>
        <TaskOverviewProperty label="Assignee">
          <div className="flex items-center gap-x-1.5">
            <MemberAvatar
              name={task.assignee.name}
              color={task.assignee.color}
              className="size-8"
            />
            <span className="text-base font-semibold">
              {task.assignee.name}
            </span>
          </div>
        </TaskOverviewProperty>
        <TaskOverviewProperty label="Due Date">
          <TaskDate dueDate={task.dueDate?.toLocaleString() || "No Due Date"} className="text-base" />
        </TaskOverviewProperty>
        <TaskOverviewProperty label="Status">
          <Badge
            className="text-sm"
            variant={
              (task.status as
                | "default"
                | "secondary"
                | "destructive"
                | "outline") ?? "default"
            }
          >
            {formatEnumCase(task.status)}
          </Badge>
        </TaskOverviewProperty>
      </div>
    </div>
  );
}
