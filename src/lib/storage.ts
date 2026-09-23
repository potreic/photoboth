import { supabase } from "./supabase";

const BUCKET = "photobooth";

// One shot per room; upsert so a retake overwrites instead of accumulating.
function shotPath(roomId: string): string {
  return `sessions/${roomId}/shot.png`;
}

// Composites are produced as canvas data URLs; convert to a Blob and upload.
export async function uploadShot(roomId: string, dataUrl: string): Promise<string> {
  const blob = await (await fetch(dataUrl)).blob();
  const path = shotPath(roomId);

  const { error } = await supabase.storage.from(BUCKET).upload(path, blob, {
    contentType: "image/png",
    upsert: true,
  });
  if (error) throw error;

  return path;
}

export function getShotUrl(path: string): string {
  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}

// Best-effort cleanup once a result is no longer needed (leaving the result
// page, refreshing, or starting a new session). Failures are safe to ignore —
// an orphaned file just sits behind an unguessable room code until removed.
export async function deleteRoomShot(roomId: string): Promise<void> {
  await supabase.storage.from(BUCKET).remove([shotPath(roomId)]);
}
