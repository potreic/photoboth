import type { RefObject } from "react";

export function VideoStage({
  localVideoRef,
  remoteVideoRef,
}: {
  localVideoRef: RefObject<HTMLVideoElement | null>;
  remoteVideoRef: RefObject<HTMLVideoElement | null>;
}) {
  return (
    <div className="grid w-full max-w-3xl grid-cols-2 gap-4">
      <video ref={localVideoRef} autoPlay muted playsInline className="w-full rounded-lg bg-neutral-900" />
      <video ref={remoteVideoRef} autoPlay playsInline className="w-full rounded-lg bg-neutral-900" />
    </div>
  );
}
