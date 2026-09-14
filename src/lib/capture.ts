// Draws the local + remote video frames side by side into one strip image.
// TODO: replace naive side-by-side layout with the real vintage-frame design,
// and upload the result to Supabase Storage instead of returning a data URL.
export function captureFrame(localVideo: HTMLVideoElement, remoteVideo: HTMLVideoElement): string {
  const tileWidth = 480;
  const tileHeight = 360;

  const canvas = document.createElement("canvas");
  canvas.width = tileWidth * 2;
  canvas.height = tileHeight;

  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(localVideo, 0, 0, tileWidth, tileHeight);
  ctx.drawImage(remoteVideo, tileWidth, 0, tileWidth, tileHeight);

  return canvas.toDataURL("image/png");
}
