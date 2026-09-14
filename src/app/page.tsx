"use client";

import { PhotoboothTitle } from "./_components/PhotoboothTitle";
import { CoinBooth } from "./_components/CoinBooth";
import { useBoothEntry } from "./_hooks/useBoothEntry";

export default function LandingPage() {
  const { phase, insertCoin, handleCurtainClosed, handleTransitionDone } = useBoothEntry();

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-10 bg-wood-texture px-6 py-10">
      <PhotoboothTitle />
      <CoinBooth
        closing={phase !== "idle"}
        onInsertCoin={insertCoin}
        onCurtainClosed={handleCurtainClosed}
      />
      <p className="max-w-sm text-center text-sm text-amber-100/80">
        A photobooth for long-distance couples. Insert a coin to start a session and send the link to your partner.
      </p>

      {phase === "transitioning" && (
        <div className="fixed inset-0 z-50 animate-fade-in bg-velvet-red" onAnimationEnd={handleTransitionDone} />
      )}
    </main>
  );
}
