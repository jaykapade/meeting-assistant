"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { deleteMeeting } from "@/api/meeting";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface DeleteMeetingButtonProps {
  meetingId: string | number;
  meetingTitle?: string;
}

export function DeleteMeetingButton({
  meetingId,
  meetingTitle,
}: DeleteMeetingButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    setError(null);
    setIsDeleting(true);

    try {
      await deleteMeeting(meetingId);
      setOpen(false);
      router.push("/");
      router.refresh();
    } catch (err) {
      console.error("Failed to delete meeting:", err);
      setError(
        "Could not delete meeting. The backend service may be unavailable."
      );
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive">Delete</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Meeting</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete{" "}
            <strong>{meetingTitle || "this meeting"}</strong>? This action
            cannot be undone.
          </DialogDescription>
        </DialogHeader>
        {error && (
          <div className="rounded-lg border border-red-500/50 bg-red-500/10 p-3 text-sm text-red-500">
            {error}
          </div>
        )}
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
