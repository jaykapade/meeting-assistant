"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { createMeeting, type CreateMeetingInput } from "@/api/meeting";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/DatePicker";

type FormState = Omit<CreateMeetingInput, "scheduled_at"> & {
  scheduled_at: Date | null;
};

export default function NewMeetingPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<FormState>({
    title: "",
    description: "",
    meeting_url: "",
    meeting_platform: "",
    scheduled_at: null,
  });

  const canSubmit = useMemo(() => form.title.trim().length > 0, [form.title]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const payload: CreateMeetingInput = {
        title: form.title.trim(),
        description: form.description?.trim() || null,
        meeting_url: form.meeting_url?.trim() || null,
        meeting_platform: form.meeting_platform?.trim() || null,
        scheduled_at: form.scheduled_at
          ? form.scheduled_at.toISOString()
          : null,
      };

      const created = await createMeeting(payload);
      router.push(`/meetings/${created.id}`);
      router.refresh();
    } catch (err) {
      console.error(err);
      setError(
        "Could not create meeting. The backend service may be unavailable."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="container mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">New Meeting</h1>
        <p className="text-muted-foreground mt-2">Add meeting details</p>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-500/50 bg-red-500/10 p-4 text-center text-red-500">
          <p>{error}</p>
        </div>
      )}

      <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
        <form onSubmit={onSubmit} className="p-6">
          <div className="grid gap-5">
            <div className="grid gap-2">
              <label htmlFor="title" className="text-sm font-medium">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                id="title"
                name="title"
                value={form.title}
                onChange={(e) =>
                  setForm((s) => ({ ...s, title: e.target.value }))
                }
                placeholder="Weekly sync"
                className="h-10 rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                autoFocus
                required
              />
            </div>

            <div className="grid gap-2">
              <label htmlFor="description" className="text-sm font-medium">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={form.description ?? ""}
                onChange={(e) =>
                  setForm((s) => ({ ...s, description: e.target.value }))
                }
                placeholder="Agenda, context, attendees..."
                className="min-h-24 rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              <div className="grid gap-2">
                <label
                  htmlFor="meeting_platform"
                  className="text-sm font-medium"
                >
                  Platform
                </label>
                <input
                  id="meeting_platform"
                  name="meeting_platform"
                  value={form.meeting_platform ?? ""}
                  onChange={(e) =>
                    setForm((s) => ({ ...s, meeting_platform: e.target.value }))
                  }
                  placeholder="Zoom / Google Meet / Teams"
                  className="h-10 rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div className="grid gap-2">
                <label htmlFor="scheduled_at" className="text-sm font-medium">
                  Scheduled at
                </label>
                <DatePicker
                  value={form.scheduled_at}
                  onChange={(dt) =>
                    setForm((s) => ({ ...s, scheduled_at: dt }))
                  }
                />
              </div>
            </div>

            <div className="grid gap-2">
              <label htmlFor="meeting_url" className="text-sm font-medium">
                Meeting URL
              </label>
              <input
                id="meeting_url"
                name="meeting_url"
                value={form.meeting_url ?? ""}
                onChange={(e) =>
                  setForm((s) => ({ ...s, meeting_url: e.target.value }))
                }
                placeholder="https://..."
                className="h-10 rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
              <Button variant="outline" asChild disabled={isSubmitting}>
                <Link href="/">Cancel</Link>
              </Button>
              <Button type="submit" disabled={!canSubmit || isSubmitting}>
                {isSubmitting ? "Creating..." : "Create meeting"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
