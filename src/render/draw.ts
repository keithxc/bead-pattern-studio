import type { LabelMode, PatternResult } from "../types";
import { relativeLuminance, rgbCss } from "../core/colorSpace";

const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
export function markerMap(pattern: PatternResult): Map<string, string> {
  const colors = [...new Set(pattern.cells.map(cell => cell.color.code))];
  return new Map(colors.map((code, i) => [code, i < 26 ? alphabet[i] : `${alphabet[Math.floor(i / 26) - 1]}${alphabet[i % 26]}`]));
}

export interface DrawOptions {
  cellSize: number;
  grid: boolean;
  labels: boolean;
  labelMode: LabelMode;
  round: boolean;
}

export function drawPattern(ctx: CanvasRenderingContext2D, pattern: PatternResult, options: DrawOptions): void {
  const { cellSize } = options;
  const markers = markerMap(pattern);
  ctx.clearRect(0, 0, pattern.width * cellSize, pattern.height * cellSize);
  ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, pattern.width * cellSize, pattern.height * cellSize);
  for (const cell of pattern.cells) {
    const x = cell.x * cellSize, y = cell.y * cellSize;
    ctx.fillStyle = rgbCss(cell.color.rgb);
    if (options.round) {
      ctx.beginPath(); ctx.arc(x + cellSize / 2, y + cellSize / 2, cellSize * .42, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,.24)"; ctx.beginPath(); ctx.arc(x + cellSize * .38, y + cellSize * .35, cellSize * .1, 0, Math.PI * 2); ctx.fill();
    } else ctx.fillRect(x, y, cellSize, cellSize);
    if (options.labels && cellSize >= 12) {
      const text = options.labelMode === "code" ? cell.color.code : markers.get(cell.color.code)!;
      ctx.fillStyle = relativeLuminance(cell.color.rgb) < 135 ? "#fff" : "#17201b";
      ctx.font = `600 ${Math.max(7, Math.min(cellSize * .36, 15))}px system-ui`;
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText(text, x + cellSize / 2, y + cellSize / 2, cellSize - 2);
    }
  }
  if (options.grid) {
    ctx.strokeStyle = "rgba(28,39,33,.25)"; ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = 0; x <= pattern.width; x++) { ctx.moveTo(x * cellSize + .5, 0); ctx.lineTo(x * cellSize + .5, pattern.height * cellSize); }
    for (let y = 0; y <= pattern.height; y++) { ctx.moveTo(0, y * cellSize + .5); ctx.lineTo(pattern.width * cellSize, y * cellSize + .5); }
    ctx.stroke();
  }
}
