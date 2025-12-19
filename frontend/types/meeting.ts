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
  scheduled_at?: string | null;

  // Recording Details
  recording_path?: string | null;
  recording_size_bytes?: number | null;
  recording_duration_seconds?: number | null;

  // AI Results
  transcript?: string | null;
  summary?: string | null;

  // JSONB
  action_items?: string[] | null;

  // Status
  status: MeetingStatus;

  // Ownership
  user_id?: number | null;

  // Timestamps
  created_at: string;
  updated_at: string;
}

export type CreateMeetingInput = {
  title: string;
  description?: string | null;
  meeting_url?: string | null;
  meeting_platform?: string | null;
  scheduled_at?: string | null;
};

export type UpdateMeetingInput = CreateMeetingInput;
