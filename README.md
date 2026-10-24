# ISITCOM Google Club

React/Vite implementation of the ISITCOM Google Club website. The original single-file prototype is preserved in `prototype.html` for visual reference.

## Run locally

```bash
pnpm install
pnpm dev
```

## Production build

```bash
pnpm build
pnpm preview
```

## Project structure

- `src/data.js` — editable club content, events, departments, team and statistics
- `src/components/Layout.jsx` — loader, navigation, theme UI and progress navigation
- `src/components/Sections.jsx` — hero, story, departments, team, events and gallery
- `src/components/JoinForm.jsx` — form state, validation and success animation
- `src/useSiteMotion.js` — GSAP, ScrollTrigger, Lenis and interaction lifecycle
- `src/styles.css` — the preserved visual system and responsive styling
- `assets/igc.png` — supplied club logo
