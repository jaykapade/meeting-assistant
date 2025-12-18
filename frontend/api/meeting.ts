import { CreateMeetingInput, Meeting } from "@/types/meeting";

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

export async function updateMeeting(
  id: string | number,
  input: CreateMeetingInput
): Promise<Meeting> {
  const response = await fetch(`${BASE_URL}/api/v1/meetings/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error("Failed to update meeting");
  }

  return response.json();
}

export async function deleteMeeting(id: string | number): Promise<void> {
  const response = await fetch(`${BASE_URL}/api/v1/meetings/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to delete meeting");
  }
}
