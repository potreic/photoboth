export function SessionHeader({ roomId }: { roomId: string }) {
  return (
    <div className="text-center">
      <p className="text-sm text-neutral-500">Session code</p>
      <p className="text-2xl font-semibold tracking-widest">{roomId}</p>
    </div>
  );
}
