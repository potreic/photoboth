"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { generateRoomCode } from "@/lib/room-code";

export type BoothPhase = "idle" | "curtain-closing" | "transitioning";

export function useBoothEntry() {
  const router = useRouter();
  const [phase, setPhase] = useState<BoothPhase>("idle");

  function insertCoin() {
    setPhase("curtain-closing");
  }

  function handleCurtainClosed() {
    setPhase("transitioning");
  }

  function handleTransitionDone() {
    router.push(`/session/${generateRoomCode()}`);
  }

  return { phase, insertCoin, handleCurtainClosed, handleTransitionDone };
}
