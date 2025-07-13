import { Role, TaskStatus } from "@/generated/prisma";

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
  id?: string;
  status: TASK_STATUS;
  position: number;
}

export type Member = {
  name: string | null;
  id: string;
  userId: string;
  email: string | null;
  workspaceId: string;
  role: Role;
  color: string;
  createdAt: Date;
  updatedAt: Date;
};

export interface MemberWithUserData {
  members : Member[]
} 

export type Project =  {
  name: string;
  id: string;
  workspaceId: string;
  createdAt: Date;
  updatedAt: Date;
  images : {
    url: string;
  }[];
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
  id: string;
  workspaceId: string;
  createdAt: Date;
  status:TaskStatus;
  title: string;
  description: string | null;
  dueDate: Date | null;
  projectId: string;
  assigneeId: string | null;
  companyId: string;
  position: number;
  project: Project;
  assignee: Member;
  relatedTasks?: Task[];
};

export enum MEMBER_ROLE {
  ADMIN = "ADMIN",
  MEMBER = "MEMBER",
}

export type Workspace = {
  images: {
    url: string;
  }[];
  } & {
  id: string;
  name: string;
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
  inviteCode: string;
};

