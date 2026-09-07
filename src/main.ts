import "./style.css";
import { palettes, type PaletteId } from "./data/palettes";
import { generatePattern } from "./core/pattern";
import { rgbCss } from "./core/colorSpace";
import { drawPattern, markerMap } from "./render/draw";
import { exportChartPng, exportColorPng } from "./render/exportPng";
import { localeNames, t, type Locale } from "./i18n";
import { APP_VERSION, REPOSITORY_URL } from "./version";
import type { PatternResult, ProjectState } from "./types";

type Theme = "system" | "light" | "dark";
const app = document.querySelector<HTMLDivElement>("#app")!;
const storedLocale = localStorage.getItem("locale") as Locale | null;
let locale: Locale = storedLocale && storedLocale in localeNames ? storedLocale : "zh-CN";
let theme = (localStorage.getItem("theme") as Theme | null) ?? "system";
const state: ProjectState = {
  image: null, imageName: "", width: 48, height: 48, lockRatio: true,
  cropMode: "cover", palette: "hama", maxColors: null, fitMode: "practical",
  previewMode: "beads", labelMode: "symbol", beadShape: "round",
  showGrid: true, showLabels: true, removeBackground: false, showGuides: true
};
let pattern: PatternResult | null = null;
let timer = 0;
let imageUrl = "";
const q = <T extends HTMLElement>(selector: string) => document.querySelector<T>(selector)!;

function applyTheme(): void {
  document.documentElement.dataset.theme = theme;
  document.documentElement.lang = locale;
  document.documentElement.style.colorScheme = theme === "system" ? "light dark" : theme;
}

function template(): string {
  const tr = (key: Parameters<typeof t>[1]) => t(locale, key);
  return `<header>
    <div class="brand"><span class="eyebrow">${tr("tagline")}</span><h1>Bead Pattern Studio</h1><p>${tr("subtitle")}</p></div>
    <div class="top-tools">
      <label>${tr("language")}<select id="language">${Object.entries(localeNames).map(([id,name])=>`<option value="${id}" ${id===locale?"selected":""}>${name}</option>`).join("")}</select></label>
      <label>${tr("theme")}<select id="theme"><option value="system">${tr("system")}</option><option value="light">${tr("light")}</option><option value="dark">${tr("dark")}</option></select></label>
      <span class="privacy">● ${tr("local")}</span>
    </div>
  </header><main>
    <aside class="panel controls">
      <section><h2>1 · ${tr("source")}</h2><label class="dropzone" id="dropzone"><input id="file" type="file" accept="image/jpeg,image/png,image/webp"><span class="upload-icon">＋</span><strong>${tr("drop")}</strong><small>${tr("formats")}</small></label><div id="filename" class="filename">${state.imageName || tr("noFile")}</div></section>
      <section><h2>2 · ${tr("gridCrop")}</h2><div class="preset-row">${[16,32,48,64,128,256].map(n=>`<button class="preset" data-size="${n}">${n}</button>`).join("")}</div><div class="field-row"><label>${tr("width")}<input id="width" type="number" min="8" max="2048" value="${state.width}"></label><button id="lock" class="icon-button ${state.lockRatio?"active":""}" title="${tr("lock")}">↔</button><label>${tr("height")}<input id="height" type="number" min="8" max="2048" value="${state.height}"></label></div><label>${tr("imageFit")}<select id="crop"><option value="cover">${tr("cover")}</option><option value="contain">${tr("contain")}</option><option value="stretch">${tr("stretch")}</option></select></label><label class="toggle"><input id="removeBg" type="checkbox" ${state.removeBackground?"checked":""}><span><b>${tr("removeBg")}</b><small>${tr("removeBgHint")}</small></span></label><div id="largeWarning" class="warning" hidden>${tr("tooLarge")}</div></section>
      <section><h2>3 · ${tr("matching")}</h2><label>${tr("palette")}<select id="palette"><option value="hama">${tr("hama")}</option><option disabled>MARD · ${tr("sourceNeeded")}</option><option disabled>Artkal · ${tr("sourceNeeded")}</option><option disabled>Perler · ${tr("sourceNeeded")}</option></select></label><label>${tr("maxColors")}<select id="maxColors"><option value="">${tr("auto")}</option>${[8,12,16,24,32,48].map(n=>`<option value="${n}">${n}</option>`).join("")}<option value="0">${tr("unlimited")}</option></select></label><div class="segmented"><button data-fit="accurate" class="${state.fitMode==="accurate"?"active":""}">${tr("best")}</button><button data-fit="practical" class="${state.fitMode==="practical"?"active":""}">${tr("practical")}</button></div><small class="hint">${tr("practicalHint")}</small></section>
      <section><h2>4 · ${tr("display")}</h2><div class="check-row"><label><input id="grid" type="checkbox" ${state.showGrid?"checked":""}> ${tr("grid")}</label><label><input id="labels" type="checkbox" ${state.showLabels?"checked":""}> ${tr("labels")}</label><label><input id="guides" type="checkbox" ${state.showGuides?"checked":""}> ${tr("guides")}</label></div><div class="field-row"><label>${tr("labels")}<select id="labelMode"><option value="symbol">${tr("shortSymbols")}</option><option value="code">${tr("codes")}</option></select></label><label>${tr("beads")}<select id="shape"><option value="round">${tr("round")}</option><option value="square">${tr("square")}</option></select></label></div></section>
    </aside>
    <section class="workspace panel"><div class="workspace-bar"><div class="tabs"><button data-view="original">${tr("original")}</button><button data-view="beads">${tr("preview")}</button><button data-view="pattern">${tr("chart")}</button></div><span id="status">${state.image?tr("processing"):tr("addImage")}</span></div><div id="stage" class="stage ${state.image?"has-image":""}"><div class="empty"><span>✦</span><strong>${tr("appear")}</strong><small>${tr("tryImage")}</small></div><img id="original" alt="${tr("original")}" src="${imageUrl}"><canvas id="canvas"></canvas></div><div class="summary"><div><small>${tr("grid").toUpperCase()}</small><strong id="gridStat">${state.width} × ${state.height}</strong></div><div><small>${tr("beads").toUpperCase()}</small><strong id="beadStat">—</strong></div><div><small>${tr("colors").toUpperCase()}</small><strong id="colorStat">—</strong></div><div class="actions"><button id="exportColor" disabled>${tr("exportPreview")}</button><button id="exportChart" class="primary" disabled>${tr("exportChart")}</button></div></div><div id="legend" class="legend"><div class="legend-empty">${tr("usageEmpty")}</div></div></section>
  </main><footer><span>${tr("openSource")} · <a href="${REPOSITORY_URL}" target="_blank" rel="noreferrer">GitHub</a> · ${APP_VERSION}</span><span>${tr("variance")}</span></footer>`;
}

function setSelect(id: string, value: string): void { q<HTMLSelectElement>(id).value = value; }

function paint(): void {
  q("#gridStat").textContent = `${state.width} × ${state.height}`;
  q("#largeWarning").toggleAttribute("hidden", state.width * state.height <= 262144);
  if (!pattern) return;
  const canvas = q<HTMLCanvasElement>("#canvas");
  const max = Math.max(pattern.width, pattern.height);
  const cellSize = Math.max(1, Math.min(30, Math.floor(760 / max)));
  canvas.width = pattern.width * cellSize;
  canvas.height = pattern.height * cellSize;
  drawPattern(canvas.getContext("2d")!, pattern, {
    cellSize, grid: state.previewMode === "pattern" && state.showGrid,
    labels: state.previewMode === "pattern" && state.showLabels,
    labelMode: state.labelMode,
    round: state.previewMode === "beads" && state.beadShape === "round",
    guides: state.previewMode === "pattern" && state.showGrid && state.showGuides
  });
  canvas.hidden = state.previewMode === "original";
  q<HTMLImageElement>("#original").hidden = state.previewMode !== "original";
  const counts = new Uint32Array(pattern.palette.length);
  let beadCount = 0;
  for (let index=0; index<pattern.colorIndices.length; index++) if (!pattern.empty[index]) { counts[pattern.colorIndices[index]]++; beadCount++; }
  const stats = [...counts.entries()].filter(([,count])=>count>0).sort((a,b)=>b[1]-a[1]);
  q("#beadStat").textContent = beadCount.toLocaleString(locale);
  q("#colorStat").textContent = String(stats.length);
  q("#status").textContent = `${t(locale,"matched")} · ${stats.length} ${t(locale,"colors")}`;
  const markers = markerMap(pattern);
  q("#legend").innerHTML = stats.map(([index,count])=>{const color=pattern!.palette[index];return `<div class="legend-item"><span class="swatch" style="background:${rgbCss(color.rgb)}"></span><strong>${markers.get(index)}</strong><span><b>${color.brand} ${color.code}</b><small>${color.name??""}</small></span><em>${count}<small>${(count/Math.max(1,beadCount)*100).toFixed(1)}%</small></em></div>`}).join("");
  q("#exportColor").removeAttribute("disabled"); q("#exportChart").removeAttribute("disabled");
  document.querySelectorAll("[data-view]").forEach(el=>el.classList.toggle("active",(el as HTMLElement).dataset.view===state.previewMode));
}

function generate(): void {
  q("#status").textContent = t(locale,"processing");
  requestAnimationFrame(()=>requestAnimationFrame(()=>{pattern=generatePattern(state,palettes[state.palette as PaletteId]);paint()}));
}
function schedule(): void { clearTimeout(timer); timer=window.setTimeout(generate,state.width*state.height>262144?350:90); }
function setSize(width:number,height:number):void {
  state.width=Math.max(8,Math.min(2048,Math.round(width)));state.height=Math.max(8,Math.min(2048,Math.round(height)));
  q<HTMLInputElement>("#width").value=String(state.width);q<HTMLInputElement>("#height").value=String(state.height);paint();schedule();
}
function loadFile(file:File):void {
  if(!/^image\/(jpeg|png|webp)$/.test(file.type)){alert(t(locale,"invalid"));return}
  const nextUrl=URL.createObjectURL(file),image=new Image();
  image.onload=()=>{if(imageUrl)URL.revokeObjectURL(imageUrl);imageUrl=nextUrl;state.image=image;state.imageName=file.name;q<HTMLImageElement>("#original").src=imageUrl;q("#filename").textContent=file.name;q("#stage").classList.add("has-image");if(state.lockRatio)setSize(state.width,state.width*image.naturalHeight/image.naturalWidth);else generate();if(matchMedia("(max-width: 850px)").matches)setTimeout(()=>q(".workspace").scrollIntoView({behavior:"smooth",block:"start"}),180)};
  image.onerror=()=>{URL.revokeObjectURL(nextUrl);alert(t(locale,"decodeError"))};image.src=nextUrl;
}

function bind():void {
  setSelect("#theme",theme);setSelect("#crop",state.cropMode);setSelect("#palette",state.palette);setSelect("#maxColors",state.maxColors===null?"":String(state.maxColors));setSelect("#labelMode",state.labelMode);setSelect("#shape",state.beadShape);
  q<HTMLSelectElement>("#language").onchange=e=>{locale=(e.target as HTMLSelectElement).value as Locale;localStorage.setItem("locale",locale);mount()};
  q<HTMLSelectElement>("#theme").onchange=e=>{theme=(e.target as HTMLSelectElement).value as Theme;localStorage.setItem("theme",theme);applyTheme()};
  const input=q<HTMLInputElement>("#file");input.onchange=()=>input.files?.[0]&&loadFile(input.files[0]);
  const drop=q("#dropzone");["dragenter","dragover"].forEach(name=>drop.addEventListener(name,event=>{event.preventDefault();drop.classList.add("dragging")}));["dragleave","drop"].forEach(name=>drop.addEventListener(name,event=>{event.preventDefault();drop.classList.remove("dragging")}));drop.addEventListener("drop",event=>{const file=(event as DragEvent).dataTransfer?.files[0];if(file)loadFile(file)});
  document.querySelectorAll<HTMLButtonElement>(".preset").forEach(button=>button.onclick=()=>setSize(Number(button.dataset.size),Number(button.dataset.size)));
  q("#lock").onclick=()=>{state.lockRatio=!state.lockRatio;q("#lock").classList.toggle("active",state.lockRatio)};
  q<HTMLInputElement>("#width").onchange=event=>{const width=Number((event.target as HTMLInputElement).value);setSize(width,state.lockRatio&&state.image?width*state.image.naturalHeight/state.image.naturalWidth:state.height)};
  q<HTMLInputElement>("#height").onchange=event=>{const height=Number((event.target as HTMLInputElement).value);setSize(state.lockRatio&&state.image?height*state.image.naturalWidth/state.image.naturalHeight:state.width,height)};
  const bindSelect=(id:string,key:keyof ProjectState,parse?:(value:string)=>unknown)=>q<HTMLSelectElement>(id).onchange=event=>{const value=(event.target as HTMLSelectElement).value;(state as unknown as Record<string,unknown>)[key]=parse?parse(value):value;schedule()};
  bindSelect("#crop","cropMode");bindSelect("#palette","palette");bindSelect("#maxColors","maxColors",value=>value===""||value==="0"?null:Number(value));bindSelect("#labelMode","labelMode");bindSelect("#shape","beadShape");
  q<HTMLInputElement>("#grid").onchange=event=>{state.showGrid=(event.target as HTMLInputElement).checked;paint()};q<HTMLInputElement>("#labels").onchange=event=>{state.showLabels=(event.target as HTMLInputElement).checked;paint()};q<HTMLInputElement>("#guides").onchange=event=>{state.showGuides=(event.target as HTMLInputElement).checked;paint()};q<HTMLInputElement>("#removeBg").onchange=event=>{state.removeBackground=(event.target as HTMLInputElement).checked;schedule()};
  document.querySelectorAll<HTMLButtonElement>("[data-fit]").forEach(button=>button.onclick=()=>{state.fitMode=button.dataset.fit as ProjectState["fitMode"];document.querySelectorAll("[data-fit]").forEach(el=>el.classList.toggle("active",el===button));schedule()});
  document.querySelectorAll<HTMLButtonElement>("[data-view]").forEach(button=>button.onclick=()=>{state.previewMode=button.dataset.view as ProjectState["previewMode"];paint()});
  q("#exportColor").onclick=async()=>{if(pattern)await exportColorPng(pattern,t(locale,"shareTitle"))};q("#exportChart").onclick=async()=>{if(pattern)await exportChartPng(pattern,state.labelMode,t(locale,"shareTitle"),state.showGuides)};
}

function mount():void {applyTheme();app.innerHTML=template();bind();paint()}
mount();
