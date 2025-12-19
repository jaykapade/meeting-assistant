"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { getMeeting, updateMeeting } from "@/requests/meeting";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/DatePicker";
import {
  CreateMeetingInput,
  Meeting,
  UpdateMeetingInput,
} from "@/types/meeting";
import { meetingFormSchema } from "@/lib/validations/meeting";

type FormState = Omit<CreateMeetingInput, "scheduled_at"> & {
  scheduled_at: Date | null;
};

type FieldErrors = {
  title?: string;
  description?: string;
  meeting_url?: string;
  meeting_platform?: string;
  scheduled_at?: string;
};

export default function EditMeetingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const [id, setId] = useState<string | null>(null);
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const [form, setForm] = useState<FormState>({
    title: "",
    description: "",
    meeting_url: "",
    meeting_platform: "",
    scheduled_at: null,
  });

  useEffect(() => {
    async function loadMeeting() {
      try {
        const resolvedParams = await params;
        const meetingId = resolvedParams.id;
        setId(meetingId);

        const meetingData = await getMeeting(meetingId);
        setMeeting(meetingData);

        // Pre-fill form with existing data
        setForm({
          title: meetingData.title || "",
          description: meetingData.description || "",
          meeting_url: meetingData.meeting_url || "",
          meeting_platform: meetingData.meeting_platform || "",
          scheduled_at: meetingData.scheduled_at
            ? new Date(meetingData.scheduled_at)
            : null,
        });
      } catch (err) {
        console.error("Failed to fetch meeting:", err);
        setError(
          "Could not load meeting. The backend service may be unavailable."
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadMeeting();
  }, [params]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!id) return;

    setError(null);
    setFieldErrors({});

    // Validate form with Zod
    const validationResult = meetingFormSchema.safeParse(form);

    if (!validationResult.success) {
      const errors: FieldErrors = {};
      validationResult.error.issues.forEach((err) => {
        const field = err.path[0] as keyof FieldErrors;
        if (field) {
          errors[field] = err.message;
        }
      });
      setFieldErrors(errors);
      return;
    }

    setIsSubmitting(true);

    try {
      const validatedData = validationResult.data;
      const payload: UpdateMeetingInput = {
        title: validatedData.title,
        description: validatedData.description,
        meeting_url: validatedData.meeting_url,
        meeting_platform: validatedData.meeting_platform,
        scheduled_at: validatedData.scheduled_at
          ? validatedData.scheduled_at.toISOString()
          : null,
      };

      await updateMeeting(id, payload);
      router.push(`/meetings/${id}`);
    } catch (err) {
      console.error(err);
      setError(
        "Could not update meeting. The backend service may be unavailable."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Edit Meeting</h1>
          <p className="text-muted-foreground mt-2">
            Loading meeting details...
          </p>
        </div>
      </div>
    );
  }

  if (!meeting) {
    return (
      <div className="container mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Edit Meeting</h1>
          <p className="text-muted-foreground mt-2">Meeting not found</p>
        </div>
        {error && (
          <div className="mb-4 rounded-lg border border-red-500/50 bg-red-500/10 p-4 text-center text-red-500">
            <p>{error}</p>
          </div>
        )}
        <Button variant="outline" asChild>
          <Link href="/">Back</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Edit Meeting</h1>
        <p className="text-muted-foreground mt-2">Update meeting details</p>
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
                onChange={(e) => {
                  setForm((s) => ({ ...s, title: e.target.value }));
                  if (fieldErrors.title) {
                    setFieldErrors((errs) => ({ ...errs, title: undefined }));
                  }
                }}
                placeholder="Weekly sync"
                className={`h-10 rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring ${
                  fieldErrors.title ? "border-red-500" : ""
                }`}
                autoFocus
              />
              {fieldErrors.title && (
                <p className="text-sm text-red-500">{fieldErrors.title}</p>
              )}
            </div>

            <div className="grid gap-2">
              <label htmlFor="description" className="text-sm font-medium">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={form.description ?? ""}
                onChange={(e) => {
                  setForm((s) => ({ ...s, description: e.target.value }));
                  if (fieldErrors.description) {
                    setFieldErrors((errs) => ({
                      ...errs,
                      description: undefined,
                    }));
                  }
                }}
                placeholder="Agenda, context, attendees..."
                className={`min-h-24 rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring ${
                  fieldErrors.description ? "border-red-500" : ""
                }`}
              />
              {fieldErrors.description && (
                <p className="text-sm text-red-500">
                  {fieldErrors.description}
                </p>
              )}
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
                  onChange={(e) => {
                    setForm((s) => ({
                      ...s,
                      meeting_platform: e.target.value,
                    }));
                    if (fieldErrors.meeting_platform) {
                      setFieldErrors((errs) => ({
                        ...errs,
                        meeting_platform: undefined,
                      }));
                    }
                  }}
                  placeholder="Zoom / Google Meet / Teams"
                  className={`h-10 rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring ${
                    fieldErrors.meeting_platform ? "border-red-500" : ""
                  }`}
                />
                {fieldErrors.meeting_platform && (
                  <p className="text-sm text-red-500">
                    {fieldErrors.meeting_platform}
                  </p>
                )}
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
                onChange={(e) => {
                  setForm((s) => ({ ...s, meeting_url: e.target.value }));
                  if (fieldErrors.meeting_url) {
                    setFieldErrors((errs) => ({
                      ...errs,
                      meeting_url: undefined,
                    }));
                  }
                }}
                placeholder="https://..."
                className={`h-10 rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring ${
                  fieldErrors.meeting_url ? "border-red-500" : ""
                }`}
              />
              {fieldErrors.meeting_url && (
                <p className="text-sm text-red-500">
                  {fieldErrors.meeting_url}
                </p>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
              <Button variant="outline" asChild disabled={isSubmitting}>
                <Link href={id ? `/meetings/${id}` : "/"}>Cancel</Link>
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Updating..." : "Update meeting"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
