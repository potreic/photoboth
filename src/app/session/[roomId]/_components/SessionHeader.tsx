import type { SessionStatus } from "../_hooks/useRoomConnection";

export function SessionHeader({ roomId, status, shareUrl }: { roomId: string; status: SessionStatus; shareUrl: string }) {
  return (
    <div className="text-center">
      <p className="text-sm text-neutral-500">Session code</p>
      <p className="text-2xl font-semibold tracking-widest">{roomId}</p>
      {status === "waiting-for-partner" && (
        <p className="mt-2 text-sm text-neutral-500">
          Share this link with your partner: <span className="font-mono">{shareUrl}</span>
        </p>
      )}
    </div>
  );
}
