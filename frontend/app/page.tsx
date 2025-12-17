import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export enum MeetingStatus {
  CREATED = "created",
  PROCESSING = "processing",
  COMPLETED = "completed",
  FAILED = "failed",
}

export interface Meeting {
  id: number;

  // Basic Info
  title: string;
  description?: string | null;

  // Meeting Details
  meeting_url?: string | null;
  meeting_platform?: string | null;
  scheduled_at?: string | null; // ISO date

  // Recording Details
  recording_path?: string | null;
  recording_size_bytes?: number | null;
  recording_duration_seconds?: number | null;

  // AI Results
  transcript?: string | null;
  summary?: string | null;

  // JSONB fields
  action_items?: string[] | null;

  // Status
  status: MeetingStatus;

  // Ownership
  user_id?: number | null;

  // Timestamps
  created_at: string;
  updated_at: string;
}

async function getMeetings(): Promise<Meeting[]> {
  const response = await fetch("http://localhost:8080/api/v1/meetings", {
    cache: "no-cache",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch meetings");
  }

  const data = await response.json();
  return data;
}

export default async function Dashboard() {
  const meetings = await getMeetings();

  console.log("meeting", meetings);

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
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Manage and track your meetings
        </p>
      </div>

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
                  <TableHead>Platform</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {meetings.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-8 text-muted-foreground"
                    >
                      No meetings available
                    </TableCell>
                  </TableRow>
                ) : (
                  meetings.map((meeting) => (
                    <TableRow key={meeting.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">
                        {meeting.title || "Untitled"}
                      </TableCell>
                      <TableCell className="max-w-md truncate">
                        {meeting.description || "-"}
                      </TableCell>
                      <TableCell>{meeting.meeting_platform || "-"}</TableCell>
                      <TableCell className="capitalize">
                        {getStatusBadge(meeting.status)}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {meeting.created_at
                          ? new Date(meeting.created_at).toLocaleDateString()
                          : "-"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
}
