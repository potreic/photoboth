const STRIP_ROTATIONS = [-6, 4, -3, 7];

function PhotoStripPoster() {
  return (
    <div className="relative grid w-full grid-cols-2 gap-2 rounded bg-neutral-950 p-3">
      {STRIP_ROTATIONS.map((rotation, i) => (
        <div
          key={i}
          style={{ transform: `rotate(${rotation}deg)` }}
          className="flex flex-col gap-[3px] rounded-sm bg-amber-50 p-[3px] shadow-md"
        >
          {[0, 1, 2].map((cell) => (
            <div key={cell} className="h-3.5 w-full rounded-[1px] bg-neutral-400/70" />
          ))}
        </div>
      ))}
    </div>
  );
}

function CoinSlot() {
  return (
    <div className="flex h-14 w-9 items-center justify-center rounded-sm bg-mirror-sheen shadow-inner">
      <div className="h-8 w-1.5 rounded-full bg-neutral-900/80" />
    </div>
  );
}

export function BoothLeftPanel({ disabled, onInsertCoin }: { disabled: boolean; onInsertCoin: () => void }) {
  return (
    <div className="flex w-[28%] flex-col items-center justify-center gap-4 border-r border-black/30 bg-wood-texture px-2 py-4">
      <PhotoStripPoster />
      <CoinSlot />
      <button
        onClick={onInsertCoin}
        disabled={disabled}
        className="rounded-full border-2 border-yellow-400 bg-red-700 px-3 py-2 text-[10px] font-bold tracking-widest text-yellow-100 transition hover:bg-red-600 disabled:opacity-60 sm:text-xs"
      >
        INSERT COIN
      </button>
    </div>
  );
}
