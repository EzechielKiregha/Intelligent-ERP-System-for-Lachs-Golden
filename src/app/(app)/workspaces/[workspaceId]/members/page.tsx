import MemberListScreen from "@/features/members/components/member-list-screen";

export default async function MemberPage() {

  return (
    <div className="w-full mx-auto space-y-6">
      <h2 className="mb-5 text-2xl font-semibold">Members</h2>
      <MemberListScreen />
    </div>
  );
}
