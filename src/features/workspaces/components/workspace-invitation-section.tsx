"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Clipboard, ClipboardCheck, Recycle } from "lucide-react";
import useConfirmDialog from "@/hooks/use-confirm-dialog";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { useWorkspaceResetInviteCode } from "../api/use-workspace-reset-invite-code";

interface WorkspaceInvitationSectionProps {
  workspaceId: string;
  inviteCode: string;
}

export default function WorkspaceInvitationSection({
  workspaceId,
  inviteCode,
}: WorkspaceInvitationSectionProps) {
  const [currentUrl, setCurrentUrl] = useState("");

  const [isCopied, setIsCopied] = useState(false);
  const router = useRouter();
  const { mutate, isPending } = useWorkspaceResetInviteCode(workspaceId);
  const [ResetInvitationConfirmDialog, confirm] = useConfirmDialog(
    "Are you sure?",
    "This process cannot be undo and you cannot invite anyone again with previous invitation code."
  );

  const handleResetCode = async () => {
    const ok = await confirm();
    if (!ok) {
      return;
    }

    mutate(
      workspaceId,
      {
        onSuccess: (data) => {
          toast.success(data.message);
          router.refresh();
        },
        onError: (data) => {
          toast.success(data.message);
        },
      }
    );
  };

  const fullInvitationUrl = `${currentUrl}/workspaces/${workspaceId}/join/${inviteCode}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(fullInvitationUrl).then(() => {
      toast.success("Invitation link copied to clipboard");
    });
    setIsCopied(true);
    setTimeout(() => {
      setIsCopied(false);
    }, 3000);
  };

  useEffect(() => {
    if (process) {
      // Access the current page URL using window.location
      setCurrentUrl(window.location.origin);
    }
  }, []);

  return (
    <>
      <ResetInvitationConfirmDialog />
      <Card className="mt-4 bg-sidebar">
        <CardHeader>
          <CardTitle className="text-lg">Invite Members</CardTitle>
          <CardDescription className="text-muted-foreground text-base">
            Use blew invite like to add members to your workspace.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-x-3">
            <Input
              value={fullInvitationUrl}
              readOnly
              disabled
              className="pointer-events-none"
            />
            <Button
              disabled={isPending}
              onClick={handleCopy}
              size={"sm"}
              variant={"outline"}
            >
              {isCopied ? <ClipboardCheck /> : <Clipboard />}
            </Button>
          </div>
          <div className="flex justify-end mt-8">
            <Button
              disabled={isPending}
              onClick={handleResetCode}
              variant={"outline"}
            >
              <Recycle /> Reset invite link
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
