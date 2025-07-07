
import CreateWorkspacesForm from "@/features/workspaces/components/create-workspaces-form";
import { useAuth } from "contents/authContext";
import { redirect } from "next/navigation";

export default async function WorkspaceCreatePage() {
  const user = useAuth().user;
  if (!user) {
    return redirect("/login");
  }

  return (
    <div className="max-w-2xl mx-auto">
      <CreateWorkspacesForm />
    </div>
  );
}
