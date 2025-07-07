"use client"
import MemberListScreen from "@/features/members/components/member-list-screen";
import { useAuth } from "contents/authContext";
import { redirect } from "next/navigation";

export default async function MemberPage() {
  const user = useAuth().user;
  if (!user) {
    return redirect("/login");
  }

  return (
    <div className="w-full mx-auto space-y-6">
      <h2 className="mb-5 text-2xl font-semibold">Members</h2>
      <MemberListScreen />
    </div>
  );
}
