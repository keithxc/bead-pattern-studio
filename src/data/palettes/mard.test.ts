import { describe, expect, it } from "vitest";
import { mard } from "./mard";

describe("MARD 221 palette", () => {
  it("contains every unique retail code in the audited dataset", () => {
    expect(mard).toHaveLength(221);
    expect(new Set(mard.map(color => color.code)).size).toBe(221);
    expect(mard[0]).toMatchObject({ brand: "MARD", code: "A1", rgb: [250, 245, 205] });
    expect(mard.at(-1)).toMatchObject({ brand: "MARD", code: "M15", rgb: [116, 125, 122] });
  });

  it("uses only purchasable-looking A-H/M codes and valid RGB channels", () => {
    for (const color of mard) {
      expect(color.code).toMatch(/^[A-HM]\d+$/);
      expect(color.rgb.every(channel => Number.isInteger(channel) && channel >= 0 && channel <= 255)).toBe(true);
    }
  });
});
