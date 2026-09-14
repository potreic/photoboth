import { useState } from "react";

export function useCapturedPhoto(roomId: string) {
  const [image] = useState<string | null>(() =>
    typeof window === "undefined" ? null : sessionStorage.getItem(`photoboth:${roomId}`)
  );

  return image;
}
