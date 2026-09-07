import type { PreparedColor } from "../types";
import { deltaE2000 } from "./deltaE";
import { pixelLab } from "./matcher";

export function optimizePractical(data:Uint8ClampedArray,indices:Uint8Array,distances:Float32Array,empty:Uint8Array,palette:PreparedColor[],width:number,height:number):void{
  const output=indices.slice(),votes=new Uint8Array(palette.length);
  for(let index=0;index<indices.length;index++){if(empty[index])continue;votes.fill(0);const x=index%width,y=Math.floor(index/width),neighbors:number[]=[];if(x)neighbors.push(index-1);if(x+1<width)neighbors.push(index+1);if(y)neighbors.push(index-width);if(y+1<height)neighbors.push(index+width);let dominant=indices[index],count=0;for(const neighbor of neighbors){if(empty[neighbor])continue;const color=indices[neighbor],value=++votes[color];if(value>count){dominant=color;count=value}}if(count<3||dominant===indices[index])continue;const current=palette[indices[index]],replacement=palette[dominant],replacementDistance=deltaE2000(pixelLab(data,index),replacement.lab),paletteGap=deltaE2000(current.lab,replacement.lab);if(replacementDistance<=distances[index]+4.5&&paletteGap<9)output[index]=dominant}indices.set(output);
}
