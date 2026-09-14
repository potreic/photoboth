"use client";

import { useRouter } from "next/navigation";
import { generateRoomCode } from "@/lib/room-code";

export default function LandingPage() {
  const router = useRouter();

  function handleCreateSession() {
    const roomId = generateRoomCode();
    router.push(`/session/${roomId}`);
  }

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 px-6 text-center">
      {/* TODO: swap this placeholder background for the wood-texture vintage photobooth look */}
      <h1 className="text-4xl font-semibold">photoboth</h1>
      <p className="max-w-sm text-sm text-neutral-500">
        A photobooth for long-distance couples. Start a session, send the link
        to your partner, and take photos together in real time.
      </p>
      <button
        onClick={handleCreateSession}
        className="rounded-full bg-neutral-900 px-6 py-3 text-sm font-medium text-white hover:bg-neutral-700"
      >
        Create a session
      </button>
    </main>
  );
}
