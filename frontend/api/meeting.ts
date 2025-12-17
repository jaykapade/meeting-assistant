import { Meeting } from "@/types/meeting";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export async function getMeetings(): Promise<Meeting[]> {
  const response = await fetch(`${BASE_URL}/api/v1/meetings`, {
    cache: "no-cache",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch meetings");
  }

  return response.json();
}

export async function getMeeting(id: string | number): Promise<Meeting> {
  const response = await fetch(`${BASE_URL}/api/v1/meetings/${id}`, {
    cache: "no-cache",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch meeting");
  }

  return response.json();
}

export type CreateMeetingInput = {
  title: string;
  description?: string | null;
  meeting_url?: string | null;
  meeting_platform?: string | null;
  scheduled_at?: string | null;
};

export async function createMeeting(
  input: CreateMeetingInput
): Promise<Meeting> {
  const response = await fetch(`${BASE_URL}/api/v1/meetings`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error("Failed to create meeting");
  }

  return response.json();
}
