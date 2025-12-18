import Link from "next/link";
import { getMeeting } from "@/api/meeting";
import { Button } from "@/components/ui/button";
import { DeleteMeetingButton } from "@/components/DeleteMeetingButton";
import { MeetingStatus, type Meeting as MeetingType } from "@/types/meeting";

function formatDateTime(value?: string | null) {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString();
}

function StatusBadge({ status }: { status: MeetingStatus }) {
  const statusStyles = {
    [MeetingStatus.CREATED]: "bg-blue-500/10 text-blue-500 dark:bg-blue-500/20",
    [MeetingStatus.PROCESSING]:
      "bg-yellow-500/10 text-yellow-500 dark:bg-yellow-500/20",
    [MeetingStatus.COMPLETED]:
      "bg-green-500/10 text-green-500 dark:bg-green-500/20",
    [MeetingStatus.FAILED]: "bg-red-500/10 text-red-500 dark:bg-red-500/20",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusStyles[status]}`}
    >
      {status}
    </span>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border bg-card text-card-foreground shadow-sm">
      <div className="border-b px-6 py-4">
        <h2 className="text-base font-semibold">{title}</h2>
      </div>
      <div className="px-6 py-4">{children}</div>
    </section>
  );
}

export default async function MeetingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let meeting: MeetingType | null = null;
  let fetchError: string | null = null;

  try {
    meeting = await getMeeting(id);
  } catch (error) {
    console.error("Failed to fetch meeting:", error);
    fetchError =
      "Could not load meeting. The backend service may be unavailable.";
  }

  if (!meeting) {
    return (
      <div className="container mx-auto">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Meeting</h1>
            <p className="text-muted-foreground mt-2">
              Meeting ID: <span className="font-mono">{id}</span>
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/">Back</Link>
          </Button>
        </div>

        {fetchError && (
          <div className="mb-4 rounded-lg border border-red-500/50 bg-red-500/10 p-4 text-center text-red-500">
            <p>{fetchError}</p>
          </div>
        )}
      </div>
    );
  }

  const hasAiOutput =
    Boolean(meeting.summary) ||
    Boolean(meeting.transcript) ||
    (meeting.action_items?.length ?? 0) > 0;

  return (
    <div className="container mx-auto">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">
              {meeting.title || "Untitled"}
            </h1>
            <StatusBadge status={meeting.status} />
          </div>
          <p className="text-muted-foreground mt-2">
            Meeting ID: <span className="font-mono">{meeting.id}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" asChild>
            <Link href="/">Back</Link>
          </Button>
          <Button asChild>
            <Link href={`/meetings/${meeting.id}/edit`}>Edit</Link>
          </Button>
          <DeleteMeetingButton
            meetingId={meeting.id}
            meetingTitle={meeting.title}
          />
        </div>
      </div>

      <div className="grid gap-6">
        <Section title="Details">
          <dl className="grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-medium text-muted-foreground">
                Description
              </dt>
              <dd className="mt-1 text-sm">{meeting.description || "-"}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-muted-foreground">
                Scheduled at
              </dt>
              <dd className="mt-1 text-sm">
                {formatDateTime(meeting.scheduled_at)}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-muted-foreground">
                Platform
              </dt>
              <dd className="mt-1 text-sm">
                {meeting.meeting_platform || "-"}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-muted-foreground">
                Meeting link
              </dt>
              <dd className="mt-1 text-sm">
                {meeting.meeting_url ? (
                  <a
                    className="text-sm underline underline-offset-4 "
                    href={meeting.meeting_url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {meeting.meeting_url}
                  </a>
                ) : (
                  "-"
                )}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-muted-foreground">
                Created
              </dt>
              <dd className="mt-1 text-sm">
                {formatDateTime(meeting.created_at)}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-muted-foreground">
                Updated
              </dt>
              <dd className="mt-1 text-sm">
                {formatDateTime(meeting.updated_at)}
              </dd>
            </div>
          </dl>
        </Section>

        <Section title="AI output">
          {!hasAiOutput ? (
            <p className="text-sm text-muted-foreground">
              No transcript/summary/action items yet. This usually appears after
              processing completes.
            </p>
          ) : (
            <div className="grid gap-6">
              {meeting.summary && (
                <div>
                  <h3 className="text-sm font-semibold">Summary</h3>
                  <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">
                    {meeting.summary}
                  </p>
                </div>
              )}

              {(meeting.action_items?.length ?? 0) > 0 && (
                <div>
                  <h3 className="text-sm font-semibold">Action items</h3>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                    {meeting.action_items!.map((item, idx) => (
                      <li key={`${idx}-${item}`}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {meeting.transcript && (
                <div>
                  <h3 className="text-sm font-semibold">Transcript</h3>
                  <pre className="mt-2 max-h-[60vh] overflow-auto whitespace-pre-wrap rounded-md border bg-background p-4 text-sm text-muted-foreground">
                    {meeting.transcript}
                  </pre>
                </div>
              )}
            </div>
          )}
        </Section>
      </div>
    </div>
  );
}
