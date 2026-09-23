import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { generateRoomCode } from "@/lib/room-code";
import { deleteRoomShot } from "@/lib/storage";
import { clearRoomPhotoPath } from "@/lib/photo-session-store";

// A lightweight broadcast-only channel (no WebRTC/presence — that connection
// was already torn down leaving the session page) just so "do it again" can
// pull both people into a fresh session instead of only restarting the
// person who clicked.
export function useSharedRestart(roomId: string) {
  const router = useRouter();
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    const channel = supabase
      .channel(`room:${roomId}`)
      .on("broadcast", { event: "restart" }, ({ payload }) => {
        router.push(`/session/${(payload as { newRoomId: string }).newRoomId}`);
      })
      .subscribe();

    channelRef.current = channel;
    return () => {
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [roomId, router]);

  function doItAgain() {
    const newRoomId = generateRoomCode();
    channelRef.current?.send({ type: "broadcast", event: "restart", payload: { newRoomId } });

    clearRoomPhotoPath(roomId);
    void deleteRoomShot(roomId);

    router.push(`/session/${newRoomId}`);
  }

  return { doItAgain };
}
