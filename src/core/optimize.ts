import type { BeadCell } from "../types";
import { deltaE2000 } from "./deltaE";

/** Removes isolated near-colors while preserving strong source edges. */
export function optimizePractical(cells: BeadCell[], width: number, height: number): BeadCell[] {
  const output = cells.map(cell => ({ ...cell }));
  for (const cell of cells) {
    const neighbors: BeadCell[] = [];
    for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]] as const) {
      const x = cell.x + dx, y = cell.y + dy;
      if (x >= 0 && x < width && y >= 0 && y < height) neighbors.push(cells[y * width + x]);
    }
    const votes = new Map<string, { count: number; cell: BeadCell }>();
    for (const n of neighbors) {
      const vote = votes.get(n.color.code) ?? { count: 0, cell: n };
      vote.count++; votes.set(n.color.code, vote);
    }
    const dominant = [...votes.values()].sort((a, b) => b.count - a.count)[0];
    if (!dominant || dominant.count < 3 || dominant.cell.color.code === cell.color.code) continue;
    const replacementDistance = deltaE2000(cell.sourceLab, dominant.cell.color.lab);
    const paletteGap = deltaE2000(cell.color.lab, dominant.cell.color.lab);
    if (replacementDistance <= cell.matchDistance + 4.5 && paletteGap < 9) {
      output[cell.y * width + cell.x].color = dominant.cell.color;
    }
  }
  return output;
}
