import type { BeadCell, Lab, PreparedColor } from "../types";
import { deltaE2000 } from "./deltaE";

export function matchPixels(pixels: Lab[], palette: PreparedColor[], width: number): BeadCell[] {
  return pixels.map((sourceLab, index) => {
    let first = palette[0], firstD = Infinity, secondD = Infinity;
    for (const color of palette) {
      const d = deltaE2000(sourceLab, color.lab);
      if (d < firstD) { secondD = firstD; firstD = d; first = color; }
      else if (d < secondD) secondD = d;
    }
    return { x: index % width, y: Math.floor(index / width), color: first, sourceLab, matchDistance: firstD, secondDistance: secondD };
  });
}
