"use client";

import { useParams } from "next/navigation";
import { useIsClient } from "@/shared/hooks/useIsClient";
import { useRoomConnection } from "./_hooks/useRoomConnection";
import { WaitingRoom } from "./_components/WaitingRoom";
import { SessionHeader } from "./_components/SessionHeader";
import { VideoStage } from "./_components/VideoStage";
import { CountdownOverlay } from "./_components/CountdownOverlay";

export default function SessionPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const { localVideoRef, remoteVideoRef, status, countdown, startCountdown } = useRoomConnection(roomId);

  const isClient = useIsClient();
  const shareUrl = isClient ? window.location.href : "";

  if (status !== "connected") {
    return <WaitingRoom roomId={roomId} shareUrl={shareUrl} />;
  }

  return (
    <main className="flex flex-1 flex-col items-center gap-6 px-6 py-10">
      <SessionHeader roomId={roomId} />
      <VideoStage localVideoRef={localVideoRef} remoteVideoRef={remoteVideoRef} />

      {countdown !== null && <CountdownOverlay secondsLeft={countdown} />}

      {countdown === null && (
        <button
          onClick={startCountdown}
          className="rounded-full bg-neutral-900 px-6 py-3 text-sm font-medium text-white hover:bg-neutral-700"
        >
          Start countdown
        </button>
      )}
    </main>
  );
}
