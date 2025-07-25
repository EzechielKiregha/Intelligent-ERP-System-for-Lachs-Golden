"use client";

import ResponsiveModal from "@/components/responsive-modal";
import { useOpenEditTaskModal } from "../hooks/use-open-edit-task-modal";
import EditTaskForm from "./edit-task-form";
import { useGetTaskById } from "../api/use-get-task-by-id";
import { useGetWorkspaceIdParam } from "@/features/workspaces/hooks/use-get-workspace-param";

export default function EditTaskModal() {
  const workspaceId = useGetWorkspaceIdParam();
  const { setIsOpen, editTaskForm, taskId, close } = useOpenEditTaskModal();
  const { data: task, isLoading } = useGetTaskById(taskId || "", workspaceId);

  if (!isLoading && !task) {
    return null;
  }

  return (
    <ResponsiveModal
      isOpen={editTaskForm}
      setIsOpen={(e) => {
        setIsOpen({ editTaskForm: e, taskId: null });
      }}
    >
      {/* TODO Implement loading skeleton form */}
      {!task && isLoading ? (
        <p>loading...</p>
      ) : (
        <EditTaskForm onCancel={close} initValue={task!} />
      )}
    </ResponsiveModal>
  );
}
