import { getMeetings } from "@/requests/meeting";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Meeting, MeetingStatus } from "@/types/meeting";
import { ExternalLink } from "lucide-react";
import Link from "next/link";

export default async function Dashboard() {
  let meetings: Meeting[] = [];
  let fetchError: string | null = null;

  try {
    meetings = await getMeetings();
  } catch (error) {
    console.error("Failed to fetch meetings:", error);
    fetchError =
      "Could not load meetings. The backend service may be unavailable.";
  }

  const getStatusBadge = (status: MeetingStatus) => {
    const statusStyles = {
      [MeetingStatus.CREATED]:
        "bg-blue-500/10 text-blue-500 dark:bg-blue-500/20",
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
  };

  return (
    <div className="container mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Manage and track your meetings
        </p>
      </div>

      {fetchError && (
        <div className="mb-4 rounded-lg border border-red-500/50 bg-red-500/10 p-4 text-center text-red-500">
          <p>{fetchError}</p>
        </div>
      )}

      <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
        <div className="p-6">
          <div className="overflow-x-auto">
            <Table>
              <TableCaption>
                {meetings.length === 0
                  ? "No meetings found. Create your first meeting to get started."
                  : `A list of your recent meetings. Total: ${meetings.length}`}
              </TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">Title</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Meeting URL</TableHead>
                  <TableHead>Platform</TableHead>
                  <TableHead className="text-right">Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {meetings.map((meeting) => (
                  <TableRow key={meeting.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">
                      <Link
                        href={`/meetings/${meeting.id}`}
                        className="underline-offset-4 hover:underline"
                      >
                        {meeting.title || "Untitled"}
                      </Link>
                    </TableCell>
                    <TableCell className="max-w-md truncate">
                      {meeting.description || "-"}
                    </TableCell>
                    <TableCell className="capitalize">
                      {getStatusBadge(meeting.status)}
                    </TableCell>
                    <TableCell>
                      {meeting.meeting_url ? (
                        <>
                          <a
                            href={meeting.meeting_url}
                            target="_blank"
                            rel="noreferrer"
                            className="underline-offset-4 hover:underline flex items-center gap-2"
                          >
                            {meeting.meeting_url}
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell>{meeting.meeting_platform || "-"}</TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {meeting.created_at
                        ? new Date(meeting.created_at).toLocaleDateString()
                        : "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
}
