"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useEffect } from "react";
import { useCapturedPhoto } from "./_hooks/useCapturedPhoto";
import { PhotoResult } from "./_components/PhotoResult";
import { deleteRoomShot } from "@/lib/storage";
import { clearRoomPhotoPath } from "@/lib/photo-session-store";

export default function ResultPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const image = useCapturedPhoto(roomId);

  // A refresh or tab close doesn't run our click handlers, so this is the
  // backstop that makes sure the shot actually gets deleted from Storage
  // rather than just losing its in-memory reference.
  useEffect(() => {
    function cleanup() {
      clearRoomPhotoPath(roomId);
      void deleteRoomShot(roomId);
    }
    window.addEventListener("pagehide", cleanup);
    return () => window.removeEventListener("pagehide", cleanup);
  }, [roomId]);

  function leaveAndCleanUp() {
    clearRoomPhotoPath(roomId);
    void deleteRoomShot(roomId);
  }

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-10 text-center">
      <h1 className="text-2xl font-semibold">Your photo</h1>
      <PhotoResult roomId={roomId} image={image} />
      <Link href="/" onClick={leaveAndCleanUp} className="text-sm text-neutral-500 underline">
        Start a new session
      </Link>
    </main>
  );
}
