import type { Lab } from "../types";

const rad = (degrees: number) => degrees * Math.PI / 180;
const deg = (radians: number) => radians * 180 / Math.PI;

/** CIEDE2000 (kL=kC=kH=1), perceptually superior to RGB distance. */
export function deltaE2000([l1, a1, b1]: Lab, [l2, a2, b2]: Lab): number {
  const c1 = Math.hypot(a1, b1), c2 = Math.hypot(a2, b2);
  const cBar = (c1 + c2) / 2;
  const g = .5 * (1 - Math.sqrt(cBar ** 7 / (cBar ** 7 + 25 ** 7)));
  const ap1 = (1 + g) * a1, ap2 = (1 + g) * a2;
  const cp1 = Math.hypot(ap1, b1), cp2 = Math.hypot(ap2, b2);
  const hp = (a: number, b: number) => {
    const value = deg(Math.atan2(b, a));
    return value < 0 ? value + 360 : value;
  };
  const hp1 = hp(ap1, b1), hp2 = hp(ap2, b2);
  const dl = l2 - l1, dc = cp2 - cp1;
  let dh = hp2 - hp1;
  if (cp1 * cp2 === 0) dh = 0;
  else if (dh > 180) dh -= 360;
  else if (dh < -180) dh += 360;
  const dH = 2 * Math.sqrt(cp1 * cp2) * Math.sin(rad(dh / 2));
  const lBar = (l1 + l2) / 2, cpBar = (cp1 + cp2) / 2;
  let hpBar = hp1 + hp2;
  if (cp1 * cp2 === 0) hpBar = hp1 + hp2;
  else if (Math.abs(hp1 - hp2) <= 180) hpBar /= 2;
  else hpBar = (hpBar + (hpBar < 360 ? 360 : -360)) / 2;
  const t = 1 - .17 * Math.cos(rad(hpBar - 30)) + .24 * Math.cos(rad(2 * hpBar))
    + .32 * Math.cos(rad(3 * hpBar + 6)) - .20 * Math.cos(rad(4 * hpBar - 63));
  const sl = 1 + .015 * (lBar - 50) ** 2 / Math.sqrt(20 + (lBar - 50) ** 2);
  const sc = 1 + .045 * cpBar, sh = 1 + .015 * cpBar * t;
  const rt = -2 * Math.sqrt(cpBar ** 7 / (cpBar ** 7 + 25 ** 7))
    * Math.sin(rad(60 * Math.exp(-(((hpBar - 275) / 25) ** 2))));
  const x = dl / sl, y = dc / sc, z = dH / sh;
  return Math.sqrt(x * x + y * y + z * z + rt * y * z);
}
