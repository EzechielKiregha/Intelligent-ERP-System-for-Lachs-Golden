export interface TaskCalendarEventCard {
  $id?: string;
  title: string;
  status: TASK_STATUS;
  start: Date;
  end: Date;
  assignee: Member;
  project: Project;
}

export interface PositionedTask {
  $id?: string;
  status: TASK_STATUS;
  position: number;
}

export type Member = {
  id: string;
  userId: string;
  name: string;
  email: string;
  workspaceId: string;
  role: MEMBER_ROLE;
  color: string;
};

export interface MemberWithUserData {
  members : Member[]
} 

export type Project = {
  id: string;
  name: string;
  imageUrl?: string | null;
  fileId: string | null;
  workspaceId: string;
};

export type ProjectAnalyticsResponse = {
  taskCount: number;
  taskDiff: number;
  assignedTaskCount: number;
  assignedTaskDiff: number;
  incompleteTaskCount: number;
  incompleteTaskDiff: number;
  completeTaskCount: number;
  completeTaskDiff: number;
  overDueTaskCount: number;
  overDueTaskDiff: number;
};

export enum TASK_STATUS {
  BACKLOG = "BACKLOG",
  IN_PROGRESS = "IN_PROGRESS",
  TODO = "TODO",
  DONE = "DONE",
  IN_REVIEW = "IN_REVIEW",
}

export type Task =  {
  $id?: string,
  name: string;
  workspaceId: string;
  projectId: string;
  assigneeId: string;
  status: string;
  dueDate: string;
  description?: string;
  project: Project;
  assignee: Member;
  position: number;
  relatedTasks?: Task[];
  $createdAt?: string
};

export enum MEMBER_ROLE {
  ADMIN = "ADMIN",
  MEMBER = "MEMBER",
}

export type Workspace = {
  $id: string;
  name: string;
  userId: string;
  imageUrl: string;
  fileId: string;
  inviteCode: string;
};

