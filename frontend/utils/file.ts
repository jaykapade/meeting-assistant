export function formatFileSize(bytes?: number | null): string {
  if (!bytes) return "-";
  const units = ["B", "KB", "MB", "GB"];
  let size = bytes;
  let unitIndex = 0;
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  return `${size.toFixed(2)} ${units[unitIndex]}`;
}

/**
 * Gets the duration of an audio file in seconds
 * @param file The audio file to get duration from
 * @returns Promise that resolves to the duration in seconds, or null if unable to determine
 */
export function getAudioDuration(file: File): Promise<number | null> {
  return new Promise((resolve) => {
    const audio = new Audio();
    const url = URL.createObjectURL(file);

    const cleanup = () => {
      URL.revokeObjectURL(url);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("error", onError);
    };

    const onLoadedMetadata = () => {
      const duration = Math.round(audio.duration);
      cleanup();
      resolve(isNaN(duration) ? null : duration);
    };

    const onError = () => {
      cleanup();
      resolve(null);
    };

    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("error", onError);
    audio.src = url;
  });
}
