import type { CropMode, RGB } from "../types";

export function sampleImage(image: HTMLImageElement, width: number, height: number, mode: CropMode): RGB[] {
  const canvas = document.createElement("canvas");
  canvas.width = width; canvas.height = height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("Canvas 2D is unavailable");
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  const iw = image.naturalWidth, ih = image.naturalHeight;
  let dx = 0, dy = 0, dw = width, dh = height;
  if (mode !== "stretch") {
    const scale = mode === "cover" ? Math.max(width / iw, height / ih) : Math.min(width / iw, height / ih);
    dw = iw * scale; dh = ih * scale; dx = (width - dw) / 2; dy = (height - dh) / 2;
    if (mode === "contain") { ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, width, height); }
  }
  ctx.drawImage(image, dx, dy, dw, dh);
  const data = ctx.getImageData(0, 0, width, height).data;
  const result: RGB[] = [];
  for (let i = 0; i < data.length; i += 4) {
    const alpha = data[i + 3] / 255;
    result.push([
      Math.round(data[i] * alpha + 255 * (1 - alpha)),
      Math.round(data[i + 1] * alpha + 255 * (1 - alpha)),
      Math.round(data[i + 2] * alpha + 255 * (1 - alpha))
    ]);
  }
  return result;
}
