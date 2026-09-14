export function WaitingRoom({ roomId, shareUrl }: { roomId: string; shareUrl: string }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 bg-velvet-red px-6 text-center text-amber-50">
      <p className="text-xs uppercase tracking-[0.3em] text-amber-100/70">Session code</p>
      <p className="font-[family-name:var(--font-bungee)] text-4xl tracking-widest">{roomId}</p>
      <p className="max-w-sm text-sm text-amber-100/80">
        Share this link with your partner — the photo session starts as soon as you&apos;re both here.
      </p>
      <p className="rounded bg-black/30 px-4 py-2 font-mono text-xs break-all">{shareUrl}</p>
      <p className="animate-pulse text-sm text-amber-100/70">Waiting for your partner…</p>
    </div>
  );
}
