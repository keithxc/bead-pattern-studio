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
  it("removes a gently varying colored background", () => {
    const A: RGB = [195, 174, 162], B: RGB = [199, 177, 164], subject: RGB = [45, 38, 36];
    const pixels: RGB[] = [A,A,A,A,A, A,B,B,B,A, A,B,subject,B,A, A,B,B,B,A, A,A,A,A,A];
    const mask = detectOuterBlank(pixels, 5, 5);
    expect(mask[0]).toBe(1);
    expect(mask[12]).toBe(0);
  });
  it("fails closed when the corners disagree", () => {
    const pixels: RGB[] = [[255,0,0],[0,0,0],[0,255,0],[0,0,0],[0,0,0],[0,0,255],[0,0,0],[255,255,0],[0,0,0]];
    expect([...detectOuterBlank(pixels, 3, 3)].every(value => value === 0)).toBe(true);
  });
});
