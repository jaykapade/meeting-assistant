"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, X, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { uploadFile, updateMeeting } from "@/requests/meeting";
import { useRouter } from "next/navigation";
import { getAudioDuration } from "@/utils/file";

interface AudioUploadDropzoneProps {
  meetingId: string | number;
  onUploadComplete?: () => void;
}

export function AudioUploadDropzone({
  meetingId,
  onUploadComplete,
}: AudioUploadDropzoneProps) {
  const router = useRouter();
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;

      const file = acceptedFiles[0];
      setError(null);
      setSuccess(false);
      setIsUploading(true);
      setUploadProgress(0);

      try {
        // Step 1: Get audio duration
        const duration = await getAudioDuration(file);

        // Step 2: Upload the file
        const uploadResponse = await uploadFile(file, (progress) => {
          setUploadProgress(progress);
        });

        // Step 3: Update meeting with recording_path, size, and duration
        await updateMeeting(meetingId, {
          recording_path: uploadResponse.file_id,
          recording_size_bytes: file.size,
          recording_duration_seconds: duration,
        });

        setSuccess(true);
        setUploadProgress(100);

        // Refresh the page after a short delay to show updated meeting
        setTimeout(() => {
          router.refresh();
          if (onUploadComplete) {
            onUploadComplete();
          }
        }, 1500);
      } catch (err) {
        console.error("Upload error:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Failed to upload recording. Please try again."
        );
        setUploadProgress(null);
      } finally {
        setIsUploading(false);
      }
    },
    [meetingId, router, onUploadComplete]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "audio/*": [".mp3", ".wav", ".m4a"],
    },
    maxFiles: 1,
    maxSize: 50 * 1024 * 1024, // 50MB
    disabled: isUploading || success,
  });

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
          transition-colors
          ${
            isDragActive
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/25 hover:border-muted-foreground/50"
          }
          ${isUploading || success ? "opacity-50 cursor-not-allowed" : ""}
        `}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-4">
          {isUploading ? (
            <>
              <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
              <div className="space-y-2">
                <p className="text-sm font-medium">Uploading recording...</p>
                {uploadProgress !== null && (
                  <div className="w-full max-w-xs mx-auto">
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {uploadProgress}%
                    </p>
                  </div>
                )}
              </div>
            </>
          ) : success ? (
            <>
              <CheckCircle2 className="w-12 h-12 text-green-500" />
              <p className="text-sm font-medium text-green-500">
                Recording uploaded successfully!
              </p>
            </>
          ) : (
            <>
              <Upload className="w-12 h-12 text-muted-foreground" />
              <div className="space-y-2">
                <p className="text-sm font-medium">
                  {isDragActive
                    ? "Drop the audio file here"
                    : "Drag & drop an audio file here, or click to select"}
                </p>
                <p className="text-xs text-muted-foreground">
                  Supports MP3, WAV, and M4A files (max 50MB)
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-500/50 bg-red-500/10 p-3 text-sm text-red-500">
          <AlertCircle className="w-4 h-4" />
          <p>{error}</p>
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto h-6 w-6"
            onClick={() => setError(null)}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}

      {success && (
        <p className="text-xs text-muted-foreground text-center">
          The meeting will be processed automatically. This page will refresh
          shortly.
        </p>
      )}
    </div>
  );
}
