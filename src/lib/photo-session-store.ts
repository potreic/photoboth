// Deliberately in-memory only (no sessionStorage/localStorage): it survives
// client-side navigation within the same tab (session -> result), but a hard
// refresh clears the JS runtime and loses it. That's intentional — see the
// "deleteRoomShot" cleanup this pairs with in the result page.
type Listener = () => void;

const photoPaths = new Map<string, string>();
const listeners = new Set<Listener>();

export function setRoomPhotoPath(roomId: string, path: string): void {
  photoPaths.set(roomId, path);
  listeners.forEach((listener) => listener());
}

export function getRoomPhotoPath(roomId: string): string | undefined {
  return photoPaths.get(roomId);
}

export function clearRoomPhotoPath(roomId: string): void {
  photoPaths.delete(roomId);
  listeners.forEach((listener) => listener());
}

export function subscribeToRoomPhoto(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
