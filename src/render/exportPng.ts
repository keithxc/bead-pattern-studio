import type { LabelMode, PatternResult } from "../types";
import { drawPattern, markerMap } from "./draw";
import { rgbCss } from "../core/colorSpace";

function download(canvas: HTMLCanvasElement, filename: string): void {
  canvas.toBlob(blob => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a"); link.href = url; link.download = filename; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }, "image/png");
}

export function exportColorPng(pattern: PatternResult): void {
  const cellSize = Math.max(16, Math.ceil(1600 / Math.max(pattern.width, pattern.height)));
  const canvas = document.createElement("canvas");
  canvas.width = pattern.width * cellSize; canvas.height = pattern.height * cellSize;
  drawPattern(canvas.getContext("2d")!, pattern, { cellSize, grid: false, labels: false, labelMode: "symbol", round: true });
  download(canvas, `bead-pattern-${pattern.width}x${pattern.height}.png`);
}

export function exportChartPng(pattern: PatternResult, labelMode: LabelMode): void {
  const cellSize = Math.max(22, Math.ceil(1800 / Math.max(pattern.width, pattern.height)));
  const stats = [...pattern.cells.reduce((map, cell) => map.set(cell.color.code, (map.get(cell.color.code) ?? 0) + 1), new Map<string, number>())];
  const legendHeight = 100 + Math.ceil(stats.length / 3) * 42;
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(pattern.width * cellSize, 1000); canvas.height = pattern.height * cellSize + legendHeight;
  const ctx = canvas.getContext("2d")!; ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, canvas.width, canvas.height);
  drawPattern(ctx, pattern, { cellSize, grid: true, labels: true, labelMode, round: false });
  const markers = markerMap(pattern), colorByCode = new Map(pattern.cells.map(c => [c.color.code, c.color]));
  ctx.fillStyle = "#17201b"; ctx.textAlign = "left"; ctx.font = "700 24px system-ui";
  ctx.fillText(`Bead Pattern · ${pattern.width} × ${pattern.height} · ${pattern.cells.length} beads`, 18, pattern.height * cellSize + 38);
  stats.forEach(([code, count], i) => {
    const col = i % 3, row = Math.floor(i / 3), x = 18 + col * Math.floor(canvas.width / 3), y = pattern.height * cellSize + 76 + row * 42;
    const color = colorByCode.get(code)!; ctx.fillStyle = rgbCss(color.rgb); ctx.fillRect(x, y - 19, 26, 26);
    ctx.strokeStyle = "#9aa39e"; ctx.strokeRect(x, y - 19, 26, 26);
    ctx.fillStyle = "#17201b"; ctx.font = "600 16px system-ui";
    ctx.fillText(`${markers.get(code)} · ${color.brand} ${code} · ${color.name ?? ""} · ${count}`, x + 36, y);
  });
  download(canvas, `bead-chart-${pattern.width}x${pattern.height}.png`);
}
