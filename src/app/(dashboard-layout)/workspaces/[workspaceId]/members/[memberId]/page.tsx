"use client"
import { redirect } from "next/navigation";
import MemberIdClientPage from "./client";
import { useAuth } from "contents/authContext";

export default async function MemberIdPage() {
  const user = useAuth().user;

  if (!user) {
    return redirect("/login");
  }

  return <MemberIdClientPage />;
}
