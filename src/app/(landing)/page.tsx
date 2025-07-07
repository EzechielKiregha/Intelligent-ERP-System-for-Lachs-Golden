
import LandingScreen from "@/components/landing-screen";
import { useGetWorkspaces } from "@/features/workspaces/api/use-get-workspaces";
import { useAuth } from "contents/authContext";

export default async function Home() {
  const user = useAuth().user;
  const { data: workspaces } = await useGetWorkspaces();

  return <LandingScreen initialUser={user} initialWorkspaces={workspaces} />;
}
