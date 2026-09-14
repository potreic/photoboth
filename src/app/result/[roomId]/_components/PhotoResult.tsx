export function PhotoResult({ roomId, image }: { roomId: string; image: string | null }) {
  if (!image) {
    return (
      <p className="text-sm text-neutral-500">
        No photo found for this session on this device.
        {/* TODO: once uploads go to Supabase Storage, fetch by roomId instead of relying on sessionStorage */}
      </p>
    );
  }

  return (
    <>
      {/* TODO: apply the vintage frame/filter here instead of the raw capture */}
      {/* eslint-disable-next-line @next/next/no-img-element -- data URL, next/image can't optimize it */}
      <img src={image} alt="Photobooth result" className="w-full max-w-2xl rounded-lg" />
      <a
        href={image}
        download={`photoboth-${roomId}.png`}
        className="rounded-full bg-neutral-900 px-6 py-3 text-sm font-medium text-white hover:bg-neutral-700"
      >
        Download
      </a>
    </>
  );
}
