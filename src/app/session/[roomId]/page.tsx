"use client";

import { useParams } from "next/navigation";
import { useIsClient } from "@/shared/hooks/useIsClient";
import { useRoomConnection } from "./_hooks/useRoomConnection";
import { WaitingRoom } from "./_components/WaitingRoom";
import { SessionHeader } from "./_components/SessionHeader";
import { VideoStage } from "./_components/VideoStage";
import { CountdownOverlay } from "./_components/CountdownOverlay";
import { PrintingAnimation } from "./_components/PrintingAnimation";

export default function SessionPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const { localVideoRef, remoteVideoRef, status, countdown, round, totalRounds, startCountdown } =
    useRoomConnection(roomId);

  const isClient = useIsClient();
  const shareUrl = isClient ? window.location.href : "";

  if (status === "developing") {
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-4 bg-velvet-red px-6 text-center text-amber-50">
        <PrintingAnimation />
      </main>
    );
  }

  if (status !== "connected" && status !== "flash") {
    return <WaitingRoom roomId={roomId} shareUrl={shareUrl} />;
  }

  const sessionStarted = round > 0 || countdown !== null;

  return (
    <main className="relative flex flex-1 flex-col items-center gap-6 px-6 py-10">
      <SessionHeader roomId={roomId} />
      <VideoStage localVideoRef={localVideoRef} remoteVideoRef={remoteVideoRef} />

      {sessionStarted && (
        <p className="text-sm text-neutral-500">
          Photo {Math.min(round + 1, totalRounds)} of {totalRounds}
        </p>
      )}

      {countdown !== null && <CountdownOverlay secondsLeft={countdown} />}

      {!sessionStarted && countdown === null && (
        <button
          onClick={startCountdown}
          className="rounded-full bg-neutral-900 px-6 py-3 text-sm font-medium text-white hover:bg-neutral-700"
        >
          Start photo session
        </button>
      )}

      {status === "flash" && <div className="animate-flash pointer-events-none fixed inset-0 bg-white" />}
    </main>
  );
}
