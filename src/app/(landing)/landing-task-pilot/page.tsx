
import LandingScreen from "@/components/landing-screen";
import { useGetWorkspaces } from "@/features/workspaces/api/use-get-workspaces";

export default async function Home() {
  const { data: workspaces } = useGetWorkspaces();

  return <LandingScreen initialWorkspaces={workspaces} />;
}
