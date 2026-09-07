import { artkal } from "./artkal";
import { hama } from "./hama";
import { mard } from "./mard";
import { perler } from "./perler";

export const palettes = { hama, mard, artkal, perler } as const;
export type PaletteId = keyof typeof palettes;
