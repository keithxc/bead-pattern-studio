import type { PreparedColor, RGB } from "../types";
import { rgbToLab } from "./colorSpace";
import { deltaE2000 } from "./deltaE";

export function limitPalette(data:Uint8ClampedArray,palette:PreparedColor[],limit:number|null):PreparedColor[]{
  if(!limit||limit>=palette.length)return palette;const count=data.length/4,stride=Math.max(1,Math.floor(count/20000)),counts=new Map<PreparedColor,number>();
  for(let index=0;index<count;index+=stride){const p=index*4,lab=rgbToLab([data[p],data[p+1],data[p+2]] as RGB);let best=palette[0],distance=Infinity;for(const color of palette){const d=deltaE2000(lab,color.lab);if(d<distance){best=color;distance=d}}counts.set(best,(counts.get(best)??0)+1)}
  const used=[...counts.entries()].sort((a,b)=>b[1]-a[1]);if(used.length<=limit)return used.map(([color])=>color);const selected=[used[0][0]];
  while(selected.length<limit){let winner=used[0][0],score=-1;for(const[candidate,weight]of used){if(selected.includes(candidate))continue;const nearest=Math.min(...selected.map(color=>deltaE2000(candidate.lab,color.lab))),candidateScore=nearest*Math.sqrt(weight);if(candidateScore>score){score=candidateScore;winner=candidate}}selected.push(winner)}return selected;
}
