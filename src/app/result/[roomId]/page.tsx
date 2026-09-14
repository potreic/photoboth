"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

export default function ResultPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const [image, setImage] = useState<string | null>(null);

  useEffect(() => {
    setImage(sessionStorage.getItem(`photoboth:${roomId}`));
  }, [roomId]);

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-10 text-center">
      <h1 className="text-2xl font-semibold">Your photo</h1>

      {image ? (
        <>
          {/* TODO: apply the vintage frame/filter here instead of the raw capture */}
          {/* eslint-disable-next-line @next/next/no-img-element -- data URL, next/image can't optimize it */}
          <img src={image} alt="Photobooth result" className="w-full max-w-2xl rounded-lg" />
          <a
            href={image}
            download={`photoboth-${roomId}.png`}
            className="rounded-full bg-neutral-900 px-6 py-3 text-sm font-medium text-white hover:bg-neutral-700"
          >
            Download
          </a>
        </>
      ) : (
        <p className="text-sm text-neutral-500">
          No photo found for this session on this device.
          {/* TODO: once uploads go to Supabase Storage, fetch by roomId instead of relying on sessionStorage */}
        </p>
      )}

      <Link href="/" className="text-sm text-neutral-500 underline">
        Start a new session
      </Link>
    </main>
  );
}
