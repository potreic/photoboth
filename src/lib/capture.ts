// Draws the local + remote video frames side by side into one strip row.
// `swapSides` puts remote on the left / local on the right instead of the
// default local-left/remote-right, for the zigzag row layout (A|B, B|A, A|B).
// TODO: replace naive side-by-side layout with the real vintage-frame design.
export function captureRow(localVideo: HTMLVideoElement, remoteVideo: HTMLVideoElement, swapSides: boolean): string {
  const tileWidth = 480;
  const tileHeight = 360;

  const canvas = document.createElement("canvas");
  canvas.width = tileWidth * 2;
  canvas.height = tileHeight;

  const ctx = canvas.getContext("2d")!;
  const leftVideo = swapSides ? remoteVideo : localVideo;
  const rightVideo = swapSides ? localVideo : remoteVideo;
  drawMirroredTile(ctx, leftVideo, 0, tileWidth, tileHeight);
  drawMirroredTile(ctx, rightVideo, tileWidth, tileWidth, tileHeight);

  return canvas.toDataURL("image/png");
}

// Selfie-style mirror for each tile independently, so the two-column layout
// stays put — matches the live preview and how people expect to see
// themselves in a photo.
function drawMirroredTile(
  ctx: CanvasRenderingContext2D,
  video: HTMLVideoElement,
  x: number,
  width: number,
  height: number
) {
  ctx.save();
  ctx.translate(x + width, 0);
  ctx.scale(-1, 1);
  ctx.drawImage(video, 0, 0, width, height);
  ctx.restore();
}

// Stacks the captured rows into one classic 3-row/2-column photo strip.
export async function stitchStrip(rowDataUrls: string[]): Promise<string> {
  const rows = await Promise.all(rowDataUrls.map(loadImage));

  const width = rows[0].width;
  const rowHeight = rows[0].height;
  const gap = 16;
  const margin = 24;

  const canvas = document.createElement("canvas");
  canvas.width = width + margin * 2;
  canvas.height = rowHeight * rows.length + gap * (rows.length - 1) + margin * 2;

  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#f5f0e6";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  rows.forEach((row, i) => {
    ctx.drawImage(row, margin, margin + i * (rowHeight + gap));
  });

  return canvas.toDataURL("image/png");
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load captured row"));
    img.src = src;
  });
}
