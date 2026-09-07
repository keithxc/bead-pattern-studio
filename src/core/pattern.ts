import type { BeadColor, PatternResult, PreparedColor, ProjectState } from "../types";
import { rgbToLab } from "./colorSpace";
import { sampleImage } from "./resize";
import { limitPalette } from "./quantize";
import { matchPixels } from "./matcher";
import { optimizePractical } from "./optimize";

export function preparePalette(colors: BeadColor[]): PreparedColor[] {
  return colors.filter(c => c.enabled).map(c => ({ ...c, lab: c.lab ?? rgbToLab(c.rgb) }));
}

export function generatePattern(state: ProjectState, colors: BeadColor[]): PatternResult | null {
  if (!state.image) return null;
  const rgb = sampleImage(state.image, state.width, state.height, state.cropMode);
  const labs = rgb.map(rgbToLab);
  const candidates = limitPalette(labs, preparePalette(colors), state.maxColors);
  let cells = matchPixels(labs, candidates, state.width);
  if (state.fitMode === "practical") cells = optimizePractical(cells, state.width, state.height);
  return { width: state.width, height: state.height, cells };
}
