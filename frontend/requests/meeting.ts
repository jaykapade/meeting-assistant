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

export type UpdateMeetingInput = Partial<
  CreateMeetingInput & {
    recording_path?: string | null;
    recording_size_bytes?: number | null;
    recording_duration_seconds?: number | null;
  }
>;

export async function updateMeeting(
  id: string | number,
  input: UpdateMeetingInput
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

export interface UploadFileResponse {
  message: string;
  file_id: string;
  filename: string;
}

export async function uploadFile(
  file: File,
  onProgress?: (progress: number) => void
): Promise<UploadFileResponse> {
  const formData = new FormData();
  formData.append("file", file);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    // Track upload progress
    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable && onProgress) {
        const progress = Math.round((e.loaded / e.total) * 100);
        onProgress(progress);
      }
    });

    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText);
          resolve(response);
        } catch {
          reject(new Error("Failed to parse response"));
        }
      } else {
        try {
          const error = JSON.parse(xhr.responseText);
          reject(new Error(error.error || "Failed to upload file"));
        } catch {
          reject(new Error("Failed to upload file"));
        }
      }
    });

    xhr.addEventListener("error", () => {
      reject(new Error("Network error during upload"));
    });

    xhr.addEventListener("abort", () => {
      reject(new Error("Upload aborted"));
    });

    xhr.open("POST", `${BASE_URL}/api/v1/file/upload`);
    xhr.send(formData);
  });
}
