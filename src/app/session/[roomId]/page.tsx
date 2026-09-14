"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { RoomConnection } from "@/lib/webrtc";
import { captureFrame } from "@/lib/capture";

type Status = "connecting" | "waiting-for-partner" | "connected";

export default function SessionPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const router = useRouter();

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const connectionRef = useRef<RoomConnection | null>(null);

  const [status, setStatus] = useState<Status>("connecting");
  const [countdown, setCountdown] = useState<number | null>(null);

  useEffect(() => {
    const connection = new RoomConnection(roomId, {
      onLocalStream: (stream) => {
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;
        setStatus("waiting-for-partner");
      },
      onRemoteStream: (stream) => {
        if (remoteVideoRef.current) remoteVideoRef.current.srcObject = stream;
      },
      onPeerJoined: () => setStatus("connected"),
      onPeerLeft: () => setStatus("waiting-for-partner"),
      onCountdown: (secondsLeft) => setCountdown(secondsLeft),
      onCaptureTrigger: () => {
        setCountdown(null);
        if (localVideoRef.current && remoteVideoRef.current) {
          const dataUrl = captureFrame(localVideoRef.current, remoteVideoRef.current);
          sessionStorage.setItem(`photoboth:${roomId}`, dataUrl);
        }
        router.push(`/result/${roomId}`);
      },
    });

    connectionRef.current = connection;
    connection.join().catch((error) => console.error("Failed to join session", error));

    return () => connection.leave();
  }, [roomId, router]);

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";

  return (
    <main className="flex flex-1 flex-col items-center gap-6 px-6 py-10">
      <div className="text-center">
        <p className="text-sm text-neutral-500">Session code</p>
        <p className="text-2xl font-semibold tracking-widest">{roomId}</p>
        {status === "waiting-for-partner" && (
          <p className="mt-2 text-sm text-neutral-500">
            Share this link with your partner: <span className="font-mono">{shareUrl}</span>
          </p>
        )}
      </div>

      <div className="grid w-full max-w-3xl grid-cols-2 gap-4">
        <video ref={localVideoRef} autoPlay muted playsInline className="w-full rounded-lg bg-neutral-900" />
        <video ref={remoteVideoRef} autoPlay playsInline className="w-full rounded-lg bg-neutral-900" />
      </div>

      {countdown !== null && (
        <p className="text-6xl font-bold">{countdown === 0 ? "📸" : countdown}</p>
      )}

      {status === "connected" && countdown === null && (
        <button
          onClick={() => connectionRef.current?.broadcastCountdown(3)}
          className="rounded-full bg-neutral-900 px-6 py-3 text-sm font-medium text-white hover:bg-neutral-700"
        >
          Start countdown
        </button>
      )}
    </main>
  );
}
