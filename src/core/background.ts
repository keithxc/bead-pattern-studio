import type { RGB } from "../types";
const isBlank=(r:number,g:number,b:number)=>Math.min(r,g,b)>=242&&Math.max(r,g,b)-Math.min(r,g,b)<=12;

/** Marks only edge-connected neutral near-white pixels as empty. */
export function detectOuterBlankRgba(data:Uint8ClampedArray,width:number,height:number):Uint8Array{
  const count=width*height,empty=new Uint8Array(count),queued=new Uint8Array(count),queue=new Int32Array(count);let head=0,tail=0;
  const push=(index:number)=>{const p=index*4;if(!queued[index]&&isBlank(data[p],data[p+1],data[p+2])){queued[index]=1;queue[tail++]=index}};
  for(let x=0;x<width;x++){push(x);push((height-1)*width+x)}for(let y=1;y<height-1;y++){push(y*width);push(y*width+width-1)}
  while(head<tail){const index=queue[head++];empty[index]=1;const x=index%width,y=Math.floor(index/width);if(x)push(index-1);if(x+1<width)push(index+1);if(y)push(index-width);if(y+1<height)push(index+width)}return empty;
}
export function detectOuterBlank(pixels:RGB[],width:number,height:number):Uint8Array{const data=new Uint8ClampedArray(pixels.length*4);pixels.forEach(([r,g,b],i)=>{data[i*4]=r;data[i*4+1]=g;data[i*4+2]=b;data[i*4+3]=255});return detectOuterBlankRgba(data,width,height)}
