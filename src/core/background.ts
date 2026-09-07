import type { Lab, RGB } from "../types";
import { rgbToLab } from "./colorSpace";
import { deltaE2000 } from "./deltaE";

const median = (values: number[]): number => {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
};

function estimateBackground(data: Uint8ClampedArray, width: number, height: number): { lab: Lab; threshold: number } | null {
  const radius = Math.max(1, Math.min(6, Math.floor(Math.min(width, height) * .06)));
  const samples: RGB[] = [];
  const addPatch = (startX: number, startY: number) => {
    for (let y = startY; y < startY + radius; y++) for (let x = startX; x < startX + radius; x++) {
      const p = (y * width + x) * 4;
      samples.push([data[p], data[p + 1], data[p + 2]]);
    }
  };
  addPatch(0, 0); addPatch(width - radius, 0);
  addPatch(0, height - radius); addPatch(width - radius, height - radius);
  const reference: RGB = [median(samples.map(c => c[0])), median(samples.map(c => c[1])), median(samples.map(c => c[2]))];
  const lab = rgbToLab(reference);
  const distances = samples.map(rgbToLab).map(sample => deltaE2000(sample, lab)).sort((a, b) => a - b);
  const p90 = distances[Math.floor(distances.length * .9)];
  // If the four corners do not describe one reasonably coherent background,
  // fail closed rather than risk erasing a complex scene or edge-touching subject.
  if (p90 > 10) return null;
  return { lab, threshold: Math.max(5, Math.min(12, p90 + 3.5)) };
}

/**
 * Detects a flat or gently varying background using the four corners, then
 * removes only pixels connected to the outer edge. Interior regions remain.
 */
export function detectOuterBlankRgba(data: Uint8ClampedArray, width: number, height: number): Uint8Array {
  const count = width * height, empty = new Uint8Array(count);
  const model = estimateBackground(data, width, height);
  if (!model) return empty;
  const queued = new Uint8Array(count), queue = new Int32Array(count);
  let head = 0, tail = 0;
  const matches = (index: number) => {
    const p = index * 4;
    return deltaE2000(rgbToLab([data[p], data[p + 1], data[p + 2]]), model.lab) <= model.threshold;
  };
  const push = (index: number) => {
    if (!queued[index] && matches(index)) { queued[index] = 1; queue[tail++] = index; }
  };
  for (let x = 0; x < width; x++) { push(x); push((height - 1) * width + x); }
  for (let y = 1; y < height - 1; y++) { push(y * width); push(y * width + width - 1); }
  while (head < tail) {
    const index = queue[head++]; empty[index] = 1;
    const x = index % width, y = Math.floor(index / width);
    if (x) push(index - 1); if (x + 1 < width) push(index + 1);
    if (y) push(index - width); if (y + 1 < height) push(index + width);
  }
  return empty;
}

export function detectOuterBlank(pixels: RGB[], width: number, height: number): Uint8Array {
  const data = new Uint8ClampedArray(pixels.length * 4);
  pixels.forEach(([r, g, b], i) => { data[i * 4] = r; data[i * 4 + 1] = g; data[i * 4 + 2] = b; data[i * 4 + 3] = 255; });
  return detectOuterBlankRgba(data, width, height);
}
