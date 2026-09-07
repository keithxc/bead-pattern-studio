export type RGB = [number, number, number];
export type Lab = [number, number, number];

export interface BeadColor {
  brand: string;
  code: string;
  name?: string;
  rgb: RGB;
  lab?: Lab;
  enabled: boolean;
}

export interface PreparedColor extends BeadColor { lab: Lab }

export interface PatternResult {
  width: number;
  height: number;
  palette: PreparedColor[];
  colorIndices: Uint8Array;
  empty: Uint8Array;
}

export type CropMode = "cover" | "contain" | "stretch";
export type FitMode = "accurate" | "practical";
export type PreviewMode = "original" | "beads" | "pattern";
export type LabelMode = "symbol" | "code";

export interface ProjectState {
  image: HTMLImageElement | null;
  imageName: string;
  width: number;
  height: number;
  lockRatio: boolean;
  cropMode: CropMode;
  palette: string;
  maxColors: number | null;
  fitMode: FitMode;
  previewMode: PreviewMode;
  labelMode: LabelMode;
  beadShape: "round" | "square";
  showGrid: boolean;
  showLabels: boolean;
  removeBackground: boolean;
  showGuides: boolean;
}
