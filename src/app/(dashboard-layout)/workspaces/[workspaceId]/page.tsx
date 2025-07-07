"use client"
import { redirect } from "next/navigation";
import React from "react";
import WorkspaceIdClientPage from "./client";
import { useAuth } from "contents/authContext";

export default async function WorkspaceIdPage() {
  const user = useAuth().user;

  if (!user) {
    return redirect("/login");
  }

  return <WorkspaceIdClientPage />;
}
