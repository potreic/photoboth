"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useCapturedPhoto } from "./_hooks/useCapturedPhoto";
import { PhotoResult } from "./_components/PhotoResult";

export default function ResultPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const image = useCapturedPhoto(roomId);

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-10 text-center">
      <h1 className="text-2xl font-semibold">Your photo</h1>
      <PhotoResult roomId={roomId} image={image} />
      <Link href="/" className="text-sm text-neutral-500 underline">
        Start a new session
      </Link>
    </main>
  );
}
