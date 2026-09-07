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
  it("ignores a small corner watermark while removing a shaded background", () => {
    const bg: RGB=[249,214,116],ink:RGB=[36,17,10],mark:RGB=[255,255,255];
    const pixels=Array.from({length:64},(_,i):RGB=>{
      const x=i%8,y=Math.floor(i/8);
      if(x>=3&&x<=4&&y>=2&&y<=5)return ink;
      if(x===7&&y===7)return mark;
      return y>=4?[249-(y-3)*7,214-(y-3)*10,116-(y-3)*7]:bg;
    });
    const mask=detectOuterBlank(pixels,8,8);
    expect(mask[0]).toBe(1);
    expect(mask[7*8+3]).toBe(1);
    expect(mask[3*8+3]).toBe(0);
  });
});
