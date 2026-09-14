"use client";

import { useParams } from "next/navigation";
import { useRoomConnection } from "./_hooks/useRoomConnection";
import { SessionHeader } from "./_components/SessionHeader";
import { VideoStage } from "./_components/VideoStage";
import { CountdownOverlay } from "./_components/CountdownOverlay";

export default function SessionPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const { localVideoRef, remoteVideoRef, status, countdown, startCountdown } = useRoomConnection(roomId);

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";

  return (
    <main className="flex flex-1 flex-col items-center gap-6 px-6 py-10">
      <SessionHeader roomId={roomId} status={status} shareUrl={shareUrl} />
      <VideoStage localVideoRef={localVideoRef} remoteVideoRef={remoteVideoRef} />

      {countdown !== null && <CountdownOverlay secondsLeft={countdown} />}

      {status === "connected" && countdown === null && (
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
