import type { CropMode } from "../types";

export function sampleImage(image: HTMLImageElement, width: number, height: number, mode: CropMode): Uint8ClampedArray {
  const canvas = document.createElement("canvas"); canvas.width=width; canvas.height=height;
  const ctx=canvas.getContext("2d",{willReadFrequently:true});if(!ctx)throw new Error("Canvas 2D is unavailable");
  ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality="high";ctx.fillStyle="#fff";ctx.fillRect(0,0,width,height);
  const iw=image.naturalWidth,ih=image.naturalHeight;let dx=0,dy=0,dw=width,dh=height;
  if(mode!=="stretch"){const scale=mode==="cover"?Math.max(width/iw,height/ih):Math.min(width/iw,height/ih);dw=iw*scale;dh=ih*scale;dx=(width-dw)/2;dy=(height-dh)/2}
  ctx.drawImage(image,dx,dy,dw,dh);return ctx.getImageData(0,0,width,height).data;
}
