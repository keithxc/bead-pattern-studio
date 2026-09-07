import type { Lab, PreparedColor } from "../types";
import { deltaE2000 } from "./deltaE";

/** Selects a compact set of real bead colors using weighted farthest-first clustering. */
export function limitPalette(pixels: Lab[], palette: PreparedColor[], limit: number | null): PreparedColor[] {
  if (!limit || limit >= palette.length) return palette;
  const counts = new Map<PreparedColor, number>();
  for (const pixel of pixels) {
    let best = palette[0], distance = Infinity;
    for (const color of palette) {
      const d = deltaE2000(pixel, color.lab);
      if (d < distance) { best = color; distance = d; }
    }
    counts.set(best, (counts.get(best) ?? 0) + 1);
  }
  const used = [...counts.entries()].sort((a, b) => b[1] - a[1]);
  if (used.length <= limit) return used.map(([color]) => color);
  const selected = [used[0][0]];
  while (selected.length < limit) {
    let winner = used[0][0], score = -1;
    for (const [candidate, weight] of used) {
      if (selected.includes(candidate)) continue;
      const nearest = Math.min(...selected.map(color => deltaE2000(candidate.lab, color.lab)));
      const candidateScore = nearest * Math.sqrt(weight);
      if (candidateScore > score) { score = candidateScore; winner = candidate; }
    }
    selected.push(winner);
  }
  return selected;
}
