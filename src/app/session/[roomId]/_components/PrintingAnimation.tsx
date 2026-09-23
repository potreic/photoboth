// The vintage-booth "developing" moment: a strip visibly feeding out of a
// printer slot. Loops rather than running once, since how long this screen
// stays up depends on the leader's upload finishing (network-dependent) —
// both peers land here together and leave together once the photo-ready
// broadcast arrives, so the animation just needs to keep looking alive
// until then, not finish on a fixed schedule.
export function PrintingAnimation() {
  return (
    <div className="flex flex-col items-center gap-6">
      <div className="relative h-44 w-28">
        <div className="absolute inset-x-0 top-9 z-10 h-3 rounded-sm bg-neutral-950 shadow-md" />
        <div className="absolute inset-x-2 top-10 h-32 overflow-hidden rounded-b-sm bg-neutral-900">
          <div className="animate-strip-feed absolute inset-x-1 top-0 h-28 rounded-sm bg-mirror-sheen" />
        </div>
      </div>
      <p className="animate-pulse text-lg">Printing your strip…</p>
    </div>
  );
}
