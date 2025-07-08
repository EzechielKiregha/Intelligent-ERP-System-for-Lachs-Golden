"use client"
import { redirect } from "next/navigation";
import TaskIdClientPage from "./client";
import { useAuth } from "contents/authContext";

export default async function TaskIdPage() {
  const user = useAuth().user;

  if (!user) {
    return redirect("/login");
  }

  return <TaskIdClientPage />;
}
