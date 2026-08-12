# FAFA — 256 shades of a name

An interactive scroll artwork about the 256 valid blue channels hidden inside `#FAFA??`.

## Run

```bash
pnpm install
pnpm dev
```

The project is a React + TypeScript + Vite application.

## Scripts

```bash
pnpm dev      # start Vite
pnpm test     # unit-test color mapping
pnpm build    # type-check and make a production build
pnpm preview  # serve the production build
```

## Interaction

- Scroll through the work to move precisely from `#FAFA00` to `#FAFAFF`.
- Pointer position adds only a small, temporary perturbation to the scroll-derived blue channel; every rendered state remains an integer channel from 0–255.
- Hover or tap a band in the 256-line field to read/select its hex value.
- Click the live central hex to lock that color, update `?b=xx`, and copy the current URL.
- Open `?b=83` (hexadecimal) to begin with a short glimpse of `#FAFA83`.
- Open `?debug=true` to see live scroll, channel, hex, FPS, and scene data.

`prefers-reduced-motion` disables ambient animation and pointer perturbation while preserving the full scroll narrative.

## Color invariant

All color conversion lives in [`src/lib/color.ts`](src/lib/color.ts):

```ts
fafaColor(0)   // #fafa00
fafaColor(255) // #fafaff
```

The related Vitest suite covers the boundary and representative channel mappings requested by the artwork specification.
