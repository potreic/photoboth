export function PhotoResult({
  roomId,
  image,
  onDoItAgain,
}: {
  roomId: string;
  image: string | null;
  onDoItAgain: () => void;
}) {
  if (!image) {
    return (
      <p className="text-sm text-neutral-500">
        This photo isn&apos;t kept anywhere after the moment passes — head back and insert a coin to take a new one
        together.
      </p>
    );
  }

  return (
    <>
      {/* TODO: apply the vintage frame/filter here instead of the raw capture */}
      {/* eslint-disable-next-line @next/next/no-img-element -- ephemeral Supabase Storage URL, not worth next/image's cache */}
      <img src={image} alt="Photobooth result" className="animate-print-strip w-full max-w-xl rounded-lg" />
      <div className="flex flex-wrap items-center justify-center gap-3">
        <a
          href={image}
          download={`photoboth-${roomId}.png`}
          className="rounded-full bg-neutral-900 px-6 py-3 text-sm font-medium text-white hover:bg-neutral-700"
        >
          Keep the Strip
        </a>
        <button
          onClick={onDoItAgain}
          className="rounded-full border border-neutral-300 px-6 py-3 text-sm font-medium text-neutral-700 hover:bg-neutral-100"
        >
          Do it again — insert a coin
        </button>
      </div>
    </>
  );
}
