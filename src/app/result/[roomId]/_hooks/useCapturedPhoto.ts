import { useIsClient } from "@/shared/hooks/useIsClient";

export function useCapturedPhoto(roomId: string) {
  const isClient = useIsClient();
  return isClient ? sessionStorage.getItem(`photoboth:${roomId}`) : null;
}
