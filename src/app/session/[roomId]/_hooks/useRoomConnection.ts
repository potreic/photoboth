import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { RoomConnection } from "@/lib/webrtc";
import { captureFrame } from "@/lib/capture";

export type SessionStatus = "connecting" | "waiting-for-partner" | "connected";

export function useRoomConnection(roomId: string) {
  const router = useRouter();

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const connectionRef = useRef<RoomConnection | null>(null);

  const [status, setStatus] = useState<SessionStatus>("connecting");
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

  function startCountdown() {
    connectionRef.current?.broadcastCountdown(3);
  }

  return { localVideoRef, remoteVideoRef, status, countdown, startCountdown };
}
