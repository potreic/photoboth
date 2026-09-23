import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { RoomConnection } from "@/lib/webrtc";
import { captureRow, stitchStrip } from "@/lib/capture";
import { uploadShot } from "@/lib/storage";
import { setRoomPhotoPath } from "@/lib/photo-session-store";

export type SessionStatus = "connecting" | "waiting-for-partner" | "connected" | "flash" | "developing";

const TOTAL_ROWS = 3;
const FLASH_DURATION_MS = 500;
const GAP_BEFORE_NEXT_ROUND_MS = 1400;

export function useRoomConnection(roomId: string) {
  const router = useRouter();

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const connectionRef = useRef<RoomConnection | null>(null);

  // Refs, not state: these drive logic inside callbacks that were registered
  // once when the connection was created, so they need the latest value on
  // every capture without re-subscribing.
  const roundRef = useRef(0);
  const rowsRef = useRef<string[]>([]);
  const isAdvancingRef = useRef(false);

  const [status, setStatus] = useState<SessionStatus>("connecting");
  const [countdown, setCountdown] = useState<number | null>(null);
  const [round, setRound] = useState(0);

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
      // Fires on both peers, once per round (whoever started it, and whoever
      // received the broadcast). Only the leader actually composites each
      // row — see RoomConnection.isLeader — the other side just mirrors the
      // flash/developing UI and waits for the final photo-ready broadcast.
      onCaptureTrigger: async () => {
        setCountdown(null);
        roundRef.current += 1;
        const currentRound = roundRef.current;
        const isFinalRound = currentRound >= TOTAL_ROWS;

        if (connectionRef.current?.isLeader && localVideoRef.current && remoteVideoRef.current) {
          // Zigzag layout: rows 1 and 3 are local|remote, row 2 is remote|local.
          const swapSides = currentRound % 2 === 0;
          rowsRef.current.push(captureRow(localVideoRef.current, remoteVideoRef.current, swapSides));
        }

        if (!isFinalRound) {
          setStatus("flash");
          setTimeout(() => setStatus("connected"), FLASH_DURATION_MS);
          setRound(currentRound);

          // Only the peer who clicked "start" drives auto-advancing through
          // the remaining rounds, so both sides don't broadcast a countdown
          // at once.
          if (isAdvancingRef.current) {
            setTimeout(() => connectionRef.current?.broadcastCountdown(3), GAP_BEFORE_NEXT_ROUND_MS);
          }
          return;
        }

        setStatus("developing");

        if (!connectionRef.current?.isLeader) return;

        try {
          const strip = await stitchStrip(rowsRef.current);
          const path = await uploadShot(roomId, strip);
          connectionRef.current?.broadcastPhotoReady(path);
          goToResult(path);
        } catch (error) {
          console.error("Failed to upload captured photo strip", error);
        }
      },
      onPhotoReady: (path) => goToResult(path),
    });

    connectionRef.current = connection;
    connection.join().catch((error) => console.error("Failed to join session", error));

    return () => connection.leave();
  }, [roomId, router]);

  function startCountdown() {
    roundRef.current = 0;
    rowsRef.current = [];
    isAdvancingRef.current = true;
    setRound(0);
    connectionRef.current?.broadcastCountdown(3);
  }

  return { localVideoRef, remoteVideoRef, status, countdown, round, totalRounds: TOTAL_ROWS, startCountdown };
}
