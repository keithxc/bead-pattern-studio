import { describe, expect, it } from "vitest";
import { deltaE2000 } from "./deltaE";

describe("deltaE2000", () => {
  it("matches the Sharma reference pair", () => {
    expect(deltaE2000([50, 2.6772, -79.7751], [50, 0, -82.7485])).toBeCloseTo(2.0425, 4);
  });
  it("is zero for identical colors", () => {
    expect(deltaE2000([50, 10, -20], [50, 10, -20])).toBe(0);
  });
});
