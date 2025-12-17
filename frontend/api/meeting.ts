import { Meeting } from "@/types/meeting";

export async function getMeetings(): Promise<Meeting[]> {
  const response = await fetch("http://localhost:8080/api/v1/meetings", {
    cache: "no-cache",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch meetings");
  }

  return response.json();
}
