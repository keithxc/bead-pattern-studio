import type { BeadColor, PatternResult, PreparedColor, ProjectState } from "../types";
import { rgbToLab } from "./colorSpace";
import { sampleImage } from "./resize";
import { limitPalette } from "./quantize";
import { matchPixels } from "./matcher";
import { optimizePractical } from "./optimize";
import { detectOuterBlankRgba } from "./background";

export function preparePalette(colors:BeadColor[]):PreparedColor[]{return colors.filter(color=>color.enabled).map(color=>({...color,lab:color.lab??rgbToLab(color.rgb)}))}
export function generatePattern(state:ProjectState,colors:BeadColor[]):PatternResult|null{
  if(!state.image)return null;const data=sampleImage(state.image,state.width,state.height,state.cropMode),palette=limitPalette(data,preparePalette(colors),state.maxColors),{indices,distances}=matchPixels(data,palette),empty=state.removeBackground?detectOuterBlankRgba(data,state.width,state.height):new Uint8Array(state.width*state.height);if(state.fitMode==="practical")optimizePractical(data,indices,distances,empty,palette,state.width,state.height);return{width:state.width,height:state.height,palette,colorIndices:indices,empty};
}
