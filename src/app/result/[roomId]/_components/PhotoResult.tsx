"use client";

import { useState, type ReactNode } from "react";

function DownloadIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 3v12m0 0-4-4m4 4 4-4M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PrintIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path
        d="M6 9V3h12v6M6 18H4a1 1 0 0 1-1-1v-5a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1h-2M6 14h12v7H6v-7Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function RestartIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 12a9 9 0 1 1 3 6.7M3 12v5m0-5h5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ActionButton({
  onClick,
  disabled,
  primary,
  icon,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  primary?: boolean;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={
        "flex items-center gap-2 rounded-md border px-5 py-2.5 text-sm font-medium transition disabled:opacity-60 " +
        (primary
          ? "border-neutral-900 bg-neutral-900 text-white hover:bg-neutral-700"
          : "border-neutral-300 text-neutral-700 hover:bg-neutral-100")
      }
    >
      {icon}
      {children}
    </button>
  );
}

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

  function handlePrint() {
    const printWindow = window.open(image!, "_blank");
    printWindow?.addEventListener("load", () => printWindow.print());
  }

  return (
    <>
      {/* TODO: apply the vintage frame/filter here instead of the raw capture */}
      {/* eslint-disable-next-line @next/next/no-img-element -- ephemeral Supabase Storage URL, not worth next/image's cache */}
      <img src={image} alt="Photobooth result" className="animate-print-strip w-full max-w-xl rounded-lg" />
      <div className="flex flex-wrap items-center justify-center gap-3">
        <ActionButton onClick={handleKeepStrip} disabled={downloading} primary icon={<DownloadIcon />}>
          {downloading ? "Saving…" : "Keep the Strip"}
        </ActionButton>
        <ActionButton onClick={handlePrint} icon={<PrintIcon />}>
          Print
        </ActionButton>
        <ActionButton onClick={onDoItAgain} icon={<RestartIcon />}>
          Do it again
        </ActionButton>
      </div>
    </>
  );
}
