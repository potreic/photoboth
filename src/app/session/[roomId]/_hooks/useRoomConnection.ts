import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { RoomConnection } from "@/lib/webrtc";
import { captureFrame } from "@/lib/capture";
import { uploadShot } from "@/lib/storage";
import { setRoomPhotoPath } from "@/lib/photo-session-store";

export type SessionStatus = "connecting" | "waiting-for-partner" | "connected" | "developing";

export function useRoomConnection(roomId: string) {
  const router = useRouter();

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const connectionRef = useRef<RoomConnection | null>(null);

  const [status, setStatus] = useState<SessionStatus>("connecting");
  const [countdown, setCountdown] = useState<number | null>(null);

  useEffect(() => {
    function goToResult(path: string) {
      setRoomPhotoPath(roomId, path);
      router.push(`/result/${roomId}`);
    }

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
      // Both peers land here (whoever started the countdown, and whoever
      // received the broadcast). Only the leader composites + uploads; the
      // other side just waits on "developing" for the photo-ready broadcast
      // below, so both navigate to /result together with the same photo.
      onCaptureTrigger: async () => {
        setCountdown(null);
        setStatus("developing");

        if (!connectionRef.current?.isLeader) return;
        if (!localVideoRef.current || !remoteVideoRef.current) return;

        try {
          const dataUrl = captureFrame(localVideoRef.current, remoteVideoRef.current);
          const path = await uploadShot(roomId, dataUrl);
          connectionRef.current?.broadcastPhotoReady(path);
          goToResult(path);
        } catch (error) {
          console.error("Failed to upload captured photo", error);
        }
      },
      onPhotoReady: (path) => goToResult(path),
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
