# Bead Pattern Studio

A privacy-first static web tool that turns photos and illustrations into practical fuse bead patterns. Images are decoded, sampled and color-matched entirely in the browser; they are never uploaded.

> **Status:** usable MVP. The built-in Hama palette uses community-measured RGB values. Always compare the chart with physical beads before buying or starting a large piece.

## Features

- Local JPG, PNG and WebP import by file picker or drag and drop
- Preset and custom grids from 8×8 to 200×200, aspect lock, cover/contain/stretch
- sRGB → CIE Lab conversion and CIEDE2000 perceptual color matching
- Optional real-palette color limit (8–48 colors)
- Accurate and practical matching modes; practical mode reduces isolated near-colors
- Original, round-bead and labeled chart previews
- Color code, quantity and percentage statistics
- Resolution-independent color preview and construction-chart PNG exports
- Responsive desktop/tablet/mobile interface
- Zero runtime dependencies, analytics, image APIs or remote services

## Stack

[Vite](https://vite.dev/), TypeScript, the Canvas 2D API and native CSS. No UI framework and no backend.

## Run locally

### Nix / NixOS

```bash
nix develop
npm ci
npm run dev
```

With direnv, run `direnv allow` once. `nix build` creates the complete static site
at `result/`, using the locked Node environment and npm dependency set.

### Other systems

```bash
npm install
npm run dev
```

Production checks:

```bash
npm test
npm run build
npm run preview
```

## GitHub Pages

The workflow in `.github/workflows/deploy-pages.yml` tests, builds and deploys every push to `main`. In the repository, open **Settings → Pages** and set **Source** to **GitHub Actions** once. The Vite base is relative, so the build works both at a user domain and under `/bead-pattern-studio/`.

## Color matching pipeline

1. Canvas resamples the source to one pixel per bead.
2. sRGB is converted to CIE Lab using a D65 reference white.
3. If a color limit is selected, a weighted farthest-first pass chooses a compact subset of **real palette colors**—never arbitrary RGB output colors.
4. Every source pixel is matched to that subset with CIEDE2000 (ΔE00).
5. Practical mode replaces only strongly isolated colors when the local majority is perceptually close. Conservative ΔE thresholds avoid erasing visible edges.

Core modules are separated under `src/core/`, so quantization and optimization can be replaced independently.

## Palettes and accuracy

Palette modules live in `src/data/palettes/` and use the `BeadColor` interface in `src/types.ts`.

The MVP enables one traceable dataset:

- **Hama (46 opaque colors):** community-measured values derived from the MIT-licensed [`cornelk/beadmachine`](https://github.com/cornelk/beadmachine). See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).

MARD, Artkal and Perler modules intentionally remain empty until reliable and redistributable data is documented. The UI does not present invented sample codes as purchasable colors.

To add a brand, create or fill its palette module, record the exact source and license, export it from `src/data/palettes/index.ts`, and add an enabled select option in `src/main.ts`. Prefer measured physical samples under controlled lighting; manufacturer product photos are not color standards.

## Privacy

There is no upload endpoint, analytics SDK, remote font, CDN asset or third-party image service. After the static assets load, image work stays inside the browser process. The app does not persist source images.

## Current limitations

- Palette RGB is only an on-screen approximation and varies with bead batch, display and lighting.
- Cropping is centered; there is no interactive crop position yet.
- Practical optimization handles isolated cells, not general connected components.
- Transparent areas are composited over white rather than represented as empty pegboard cells.
- No manual editor, saved project format, inventory filter or PDF export yet.

## Roadmap

- Manual brush, eyedropper, fill, empty cell and undo/redo tools
- Audited MARD, Artkal and Perler palettes plus per-color inventory toggles
- Interactive crop position, background removal and empty cells
- A4 multi-page PDF export with alignment marks
- Project JSON import/export and local autosave

## License

Copyright © 2026 Keith Xu. Source code is available under the [MIT License](LICENSE). Product and brand names belong to their respective owners; this independent project is not endorsed by bead manufacturers.
