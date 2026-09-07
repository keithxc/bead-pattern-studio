import type { Lab, RGB } from "../types";

export function rgbToLab([r8, g8, b8]: RGB): Lab {
  const linear = (v: number) => {
    v /= 255;
    return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  const r = linear(r8), g = linear(g8), b = linear(b8);
  const x = (r * .4124564 + g * .3575761 + b * .1804375) / .95047;
  const y = (r * .2126729 + g * .7151522 + b * .0721750);
  const z = (r * .0193339 + g * .1191920 + b * .9503041) / 1.08883;
  const f = (v: number) => v > 216 / 24389 ? Math.cbrt(v) : (24389 / 27 * v + 16) / 116;
  return [116 * f(y) - 16, 500 * (f(x) - f(y)), 200 * (f(y) - f(z))];
}

export const rgbCss = ([r, g, b]: RGB) => `rgb(${r} ${g} ${b})`;

export function relativeLuminance([r, g, b]: RGB): number {
  return .2126 * r + .7152 * g + .0722 * b;
}
