import "./style.css";
import { palettes, type PaletteId } from "./data/palettes";
import { generatePattern } from "./core/pattern";
import { rgbCss } from "./core/colorSpace";
import { drawPattern, markerMap } from "./render/draw";
import { exportChartPng, exportColorPng } from "./render/exportPng";
import type { PatternResult, ProjectState } from "./types";

const app = document.querySelector<HTMLDivElement>("#app")!;
app.innerHTML = `
  <header><div><span class="eyebrow">PRIVATE · LOCAL · PRACTICAL</span><h1>Bead Pattern Studio</h1><p>Turn an image into a buildable fuse bead chart—nothing leaves your browser.</p></div><span class="privacy">● Local processing only</span></header>
  <main>
    <aside class="panel controls">
      <section><h2>1 · Source image</h2><label class="dropzone" id="dropzone"><input id="file" type="file" accept="image/jpeg,image/png,image/webp"><span class="upload-icon">＋</span><strong>Drop an image or browse</strong><small>JPG, PNG or WebP · processed locally</small></label><div id="filename" class="filename">No image selected</div></section>
      <section><h2>2 · Grid & crop</h2><div class="preset-row">${[16,24,32,48,64].map(n => `<button class="preset" data-size="${n}">${n}</button>`).join("")}</div><div class="field-row"><label>Width<input id="width" type="number" min="8" max="200" value="48"></label><button id="lock" class="icon-button active" title="Lock source aspect ratio">↔</button><label>Height<input id="height" type="number" min="8" max="200" value="48"></label></div><label>Image fit<select id="crop"><option value="cover">Cover · crop edges</option><option value="contain">Contain · add margin</option><option value="stretch">Stretch</option></select></label></section>
      <section><h2>3 · Color matching</h2><label>Bead palette<select id="palette"><option value="hama">Hama · community measured (46)</option><option disabled>MARD · data source needed</option><option disabled>Artkal · data source needed</option><option disabled>Perler · data source needed</option></select></label><label>Maximum colors<select id="maxColors"><option value="">Auto</option>${[8,12,16,24,32,48].map(n => `<option>${n}</option>`).join("")}<option value="0">Unlimited</option></select></label><div class="segmented"><button data-fit="accurate">Best match</button><button data-fit="practical" class="active">Practical</button></div><small class="hint">Practical mode merges isolated near-colors while preserving visible edges.</small></section>
      <section><h2>4 · Chart display</h2><div class="check-row"><label><input id="grid" type="checkbox" checked> Grid</label><label><input id="labels" type="checkbox" checked> Labels</label></div><div class="field-row"><label>Labels<select id="labelMode"><option value="symbol">Short symbols</option><option value="code">Color codes</option></select></label><label>Beads<select id="shape"><option value="round">Round</option><option value="square">Square</option></select></label></div></section>
    </aside>
    <section class="workspace panel">
      <div class="workspace-bar"><div class="tabs"><button data-view="original">Original</button><button data-view="beads" class="active">Bead preview</button><button data-view="pattern">Chart</button></div><span id="status">Add an image to begin</span></div>
      <div id="stage" class="stage"><div class="empty"><span>✦</span><strong>Your pattern will appear here</strong><small>Try a clear photo, illustration, logo or pixel art.</small></div><img id="original" alt="Original preview"><canvas id="canvas"></canvas></div>
      <div class="summary"><div><small>GRID</small><strong id="gridStat">48 × 48</strong></div><div><small>BEADS</small><strong id="beadStat">—</strong></div><div><small>COLORS</small><strong id="colorStat">—</strong></div><div class="actions"><button id="exportColor" disabled>Export preview PNG</button><button id="exportChart" class="primary" disabled>Export chart PNG</button></div></div>
      <div id="legend" class="legend"><div class="legend-empty">Color usage will appear after conversion.</div></div>
    </section>
  </main><footer>Open source · MIT License <span>Color appearance varies by screen, lighting and manufacturing batch.</span></footer>`;

const $ = <T extends HTMLElement>(selector: string) => document.querySelector<T>(selector)!;
const state: ProjectState = { image: null, imageName: "", width: 48, height: 48, lockRatio: true, cropMode: "cover", palette: "hama", maxColors: null, fitMode: "practical", previewMode: "beads", labelMode: "symbol", beadShape: "round", showGrid: true, showLabels: true };
let pattern: PatternResult | null = null, timer = 0;
const canvas = $("#canvas") as HTMLCanvasElement, original = $("#original") as HTMLImageElement;

function render(): void {
  pattern = generatePattern(state, palettes[state.palette as PaletteId]);
  $("#gridStat").textContent = `${state.width} × ${state.height}`;
  if (!pattern) return;
  const max = Math.max(pattern.width, pattern.height), cellSize = Math.max(4, Math.min(30, Math.floor(760 / max)));
  canvas.width = pattern.width * cellSize; canvas.height = pattern.height * cellSize;
  drawPattern(canvas.getContext("2d")!, pattern, { cellSize, grid: state.previewMode === "pattern" && state.showGrid, labels: state.previewMode === "pattern" && state.showLabels, labelMode: state.labelMode, round: state.previewMode === "beads" && state.beadShape === "round" });
  canvas.hidden = state.previewMode === "original"; original.hidden = state.previewMode !== "original";
  const counts = pattern.cells.reduce((map, cell) => map.set(cell.color.code, (map.get(cell.color.code) ?? 0) + 1), new Map<string, number>());
  $("#beadStat").textContent = pattern.cells.length.toLocaleString(); $("#colorStat").textContent = String(counts.size);
  $("#status").textContent = `Matched with CIEDE2000 · ${counts.size} colors`;
  const markers = markerMap(pattern), colors = new Map(pattern.cells.map(c => [c.color.code, c.color]));
  $("#legend").innerHTML = [...counts.entries()].sort((a,b) => b[1]-a[1]).map(([code,count]) => { const c=colors.get(code)!; return `<div class="legend-item"><span class="swatch" style="background:${rgbCss(c.rgb)}"></span><strong>${markers.get(code)}</strong><span><b>${c.brand} ${code}</b><small>${c.name ?? ""}</small></span><em>${count}<small>${(count/pattern!.cells.length*100).toFixed(1)}%</small></em></div>`; }).join("");
  $("#exportColor").removeAttribute("disabled"); $("#exportChart").removeAttribute("disabled");
}
function schedule(): void { window.clearTimeout(timer); timer = window.setTimeout(render, 90); }
function setSize(width: number, height: number): void { state.width = Math.max(8, Math.min(200, Math.round(width))); state.height = Math.max(8, Math.min(200, Math.round(height))); ($("#width") as HTMLInputElement).value=String(state.width); ($("#height") as HTMLInputElement).value=String(state.height); schedule(); }

function loadFile(file: File): void {
  if (!/^image\/(jpeg|png|webp)$/.test(file.type)) { alert("Please choose a JPG, PNG or WebP image."); return; }
  const url = URL.createObjectURL(file), image = new Image();
  image.onload = () => { if (original.src.startsWith("blob:")) URL.revokeObjectURL(original.src); state.image=image; state.imageName=file.name; original.src=url; $("#filename").textContent=file.name; $("#stage").classList.add("has-image"); if(state.lockRatio) setSize(state.width, state.width * image.naturalHeight / image.naturalWidth); else render(); };
  image.onerror = () => { URL.revokeObjectURL(url); alert("This image could not be decoded."); }; image.src=url;
}

const fileInput = $("#file") as HTMLInputElement; fileInput.addEventListener("change", () => fileInput.files?.[0] && loadFile(fileInput.files[0]));
const dropzone=$("#dropzone"); ["dragenter","dragover"].forEach(e=>dropzone.addEventListener(e,event=>{event.preventDefault();dropzone.classList.add("dragging");})); ["dragleave","drop"].forEach(e=>dropzone.addEventListener(e,event=>{event.preventDefault();dropzone.classList.remove("dragging");})); dropzone.addEventListener("drop",event=>{const f=(event as DragEvent).dataTransfer?.files[0];if(f)loadFile(f);});
document.querySelectorAll<HTMLButtonElement>(".preset").forEach(button=>button.onclick=()=>setSize(Number(button.dataset.size),Number(button.dataset.size)));
$("#lock").onclick=()=>{state.lockRatio=!state.lockRatio;$("#lock").classList.toggle("active",state.lockRatio);};
$("#width").addEventListener("input",e=>{const w=Number((e.target as HTMLInputElement).value);setSize(w,state.lockRatio&&state.image?w*state.image.naturalHeight/state.image.naturalWidth:state.height);});
$("#height").addEventListener("input",e=>{const h=Number((e.target as HTMLInputElement).value);setSize(state.lockRatio&&state.image?h*state.image.naturalWidth/state.image.naturalHeight:state.width,h);});
const bindSelect=(id:string,key:keyof ProjectState,parse?:(value:string)=>unknown)=>$(id).addEventListener("change",e=>{const value=(e.target as HTMLSelectElement).value;(state as unknown as Record<string,unknown>)[key]=parse?parse(value):value;schedule();});
bindSelect("#crop","cropMode");bindSelect("#palette","palette");bindSelect("#maxColors","maxColors",v=>v===""?null:v==="0"?null:Number(v));bindSelect("#labelMode","labelMode");bindSelect("#shape","beadShape");
$("#grid").addEventListener("change",e=>{state.showGrid=(e.target as HTMLInputElement).checked;schedule();}); $("#labels").addEventListener("change",e=>{state.showLabels=(e.target as HTMLInputElement).checked;schedule();});
document.querySelectorAll<HTMLButtonElement>("[data-fit]").forEach(b=>b.onclick=()=>{state.fitMode=b.dataset.fit as ProjectState["fitMode"];document.querySelectorAll("[data-fit]").forEach(x=>x.classList.toggle("active",x===b));schedule();});
document.querySelectorAll<HTMLButtonElement>("[data-view]").forEach(b=>b.onclick=()=>{state.previewMode=b.dataset.view as ProjectState["previewMode"];document.querySelectorAll("[data-view]").forEach(x=>x.classList.toggle("active",x===b));schedule();});
$("#exportColor").onclick=()=>pattern&&exportColorPng(pattern);$("#exportChart").onclick=()=>pattern&&exportChartPng(pattern,state.labelMode);
