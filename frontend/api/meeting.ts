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
