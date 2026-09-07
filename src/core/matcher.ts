import type { Lab, PreparedColor, RGB } from "../types";
import { rgbToLab } from "./colorSpace";
import { deltaE2000 } from "./deltaE";

export interface MatchResult{indices:Uint8Array;distances:Float32Array}
export function matchPixels(data:Uint8ClampedArray,palette:PreparedColor[]):MatchResult{
  const count=data.length/4,indices=new Uint8Array(count),distances=new Float32Array(count),cache=new Map<number,{index:number;distance:number}>();
  for(let i=0;i<count;i++){const p=i*4,r=data[p],g=data[p+1],b=data[p+2],key=((r>>2)<<12)|((g>>2)<<6)|(b>>2),cached=cache.get(key);if(cached){indices[i]=cached.index;distances[i]=cached.distance;continue}const lab=rgbToLab([r,g,b] as RGB);let best=0,bestDistance=Infinity;for(let c=0;c<palette.length;c++){const distance=deltaE2000(lab,palette[c].lab);if(distance<bestDistance){best=c;bestDistance=distance}}indices[i]=best;distances[i]=bestDistance;cache.set(key,{index:best,distance:bestDistance})}return{indices,distances};
}
export function pixelLab(data:Uint8ClampedArray,index:number):Lab{const p=index*4;return rgbToLab([data[p],data[p+1],data[p+2]])}
