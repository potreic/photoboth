import { useSyncExternalStore } from "react";
import { getRoomPhotoPath, subscribeToRoomPhoto } from "@/lib/photo-session-store";
import { getShotUrl } from "@/lib/storage";

function getServerSnapshot() {
  return undefined;
}

// Resolves to null after a hard refresh (or when opening the result link
// without going through the flow) — the in-memory store is gone, and we
// deliberately don't re-fetch by roomId. See _components/PhotoResult.tsx.
export function useCapturedPhoto(roomId: string): string | null {
  const path = useSyncExternalStore(subscribeToRoomPhoto, () => getRoomPhotoPath(roomId), getServerSnapshot);

  return path ? getShotUrl(path) : null;
}
