"use client"
import { redirect } from "next/navigation";
import TasksClientPage from "./client";
import { useAuth } from "contents/authContext";

export default async function TasksPage() {
  const user = useAuth().user;

  if (!user) {
    return redirect("/login");
  }

  return <TasksClientPage />;
}
