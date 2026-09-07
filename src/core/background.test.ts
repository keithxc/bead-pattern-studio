import { describe, expect, it } from "vitest";
import { detectOuterBlank } from "./background";
import type { RGB } from "../types";

describe("detectOuterBlank", () => {
  it("removes edge-connected white but keeps enclosed white", () => {
    const W: RGB = [255, 255, 255], B: RGB = [0, 0, 0];
    const pixels: RGB[] = [W,W,W,W,W, W,B,B,B,W, W,B,W,B,W, W,B,B,B,W, W,W,W,W,W];
    const mask = detectOuterBlank(pixels, 5, 5);
    expect(mask[0]).toBe(1);
    expect(mask[12]).toBe(0);
  });
  it("does not remove saturated light colors", () => {
    expect(detectOuterBlank([[250, 245, 220]], 1, 1)[0]).toBe(0);
  });
});
