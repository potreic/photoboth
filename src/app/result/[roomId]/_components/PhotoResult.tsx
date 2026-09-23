"use client";

import { useState } from "react";

export function PhotoResult({
  roomId,
  image,
  onDoItAgain,
}: {
  roomId: string;
  image: string | null;
  onDoItAgain: () => void;
}) {
  const [downloading, setDownloading] = useState(false);

  if (!image) {
    return (
      <p className="text-sm text-neutral-500">
        This photo isn&apos;t kept anywhere after the moment passes — head back and insert a coin to take a new one
        together.
      </p>
    );
  }

  // The Storage URL is cross-origin, so a plain <a download> is silently
  // ignored by the browser (it just navigates to the image instead of
  // saving it). Fetching the bytes ourselves and downloading via a same-
  // origin blob: URL is what actually triggers a save.
  async function handleKeepStrip() {
    setDownloading(true);
    try {
      const blob = await (await fetch(image!)).blob();
      const blobUrl = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `photoboth-${roomId}.png`;
      link.click();

      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Failed to download photo strip", error);
    } finally {
      setDownloading(false);
    }
  }

  return (
    <>
      {/* TODO: apply the vintage frame/filter here instead of the raw capture */}
      {/* eslint-disable-next-line @next/next/no-img-element -- ephemeral Supabase Storage URL, not worth next/image's cache */}
      <img src={image} alt="Photobooth result" className="animate-print-strip w-full max-w-xl rounded-lg" />
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={handleKeepStrip}
          disabled={downloading}
          className="rounded-full bg-neutral-900 px-6 py-3 text-sm font-medium text-white hover:bg-neutral-700 disabled:opacity-60"
        >
          {downloading ? "Saving…" : "Keep the Strip"}
        </button>
        <button
          onClick={onDoItAgain}
          className="rounded-full border border-neutral-300 px-6 py-3 text-sm font-medium text-neutral-700 hover:bg-neutral-100"
        >
          Do it again — insert a coin
        </button>
      </div>
    </>
  );
}
