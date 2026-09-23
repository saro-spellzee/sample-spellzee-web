---
name: screen-to-nextjs
description: Converts a Claude Design screen export in this repo's `screens/<screen>/` folder (Main.dc.html + assets/ + support.js + vendor/) into production Next.js 16 + Tailwind v4 code for spellzee-web, with feature-folder components, design tokens, typed content, ported interactivity, and screenshot-verified visual fidelity at desktop/tablet/phone widths. Use this whenever the user wants a screen/page/section from `screens/` built, converted, implemented, ported, or "made into Next.js/React", mentions `Main.dc.html`, `.dc.html`, an x-dc/design-canvas export, or says things like "convert the homepage", "build the pricing screen", "implement screens/about", "add the new screen from design", or wants an already-converted screen re-synced with an updated export, even if they don't say "convert". Prefer this over the generic html-to-react and figma-pixel-perfect skills for anything under `screens/`.
---

# screens/ → Next.js

Turn a design export in `screens/<screen>/` into code that a senior engineer on this
project would be happy to maintain. It should look identical to the design at every
breakpoint, and be structured, typed, accessible and fast. The export is a precise
**reference mockup**, not code to port: its values (colours, sizes, spacing, copy,
behaviour) are the spec, and its runtime (`support.js`, `vendor/`, the `DCLogic` class
structure) is thrown away.

Two failure modes to steer between:
- **Too literal**: inline-style soup, one 1,000-line component, hex codes everywhere,
  `dangerouslySetInnerHTML`, the logic class pasted into a `useEffect`. It works, but it's
  unmaintainable.
- **Too loose**: "cleaned up" copy, snapped-to-palette colours, spacing by eye, dropped
  hover states and animations. The code is tidy but it no longer matches the design.

Exact values, idiomatic structure.

## Read first (every time)

1. `AGENTS.md`: this Next.js version has breaking changes. Before writing code, skim
   the relevant guides in `node_modules/next/dist/docs/01-app/` (at minimum
   `01-getting-started/12-images.md`, `13-fonts.md`, `05-server-and-client-components.md`,
   `11-css.md`, `14-metadata-and-og-images.md`) and heed deprecations (e.g. `next/image`
   `priority` → `preload`).
2. `references/x-dc-format.md`: how to read `Main.dc.html` (template syntax, the logic
   class, what maps to what).
3. `references/conventions.md`: where files go, tokens, breakpoints, fonts, content,
   tones, icons, images, server/client split.
4. Existing code: `src/app/globals.css`, `src/components/ui/`, `src/lib/`, and any
   already-converted `src/features/*`. Later screens must **reuse** the tokens, primitives,
   header and footer that earlier conversions created, not duplicate them.

## Workflow

### 1. Inventory (facts before code)

```bash
node .claude/skills/screen-to-nextjs/scripts/inventory.mjs screens/<screen>/Main.dc.html --out <scratch>/inventory.md
```

This gives the landmark list (each `header/section/footer` with its line range, loops,
conditionals, handlers, refs, canvases, classes, assets), token frequency tables,
the logic class's state and browser APIs, and an asset table with dimensions and alt
text. Read it, then read `Main.dc.html` section by section using the line ranges.
The file is too big to hold in your head at once, so work through it in chunks.

Then capture the original so you can *see* the design at each width:

```bash
node .claude/skills/screen-to-nextjs/scripts/capture.mjs --original screens/<screen>/Main.dc.html --only original --out <scratch>/capture
```

(Needs `playwright` in the project: `npm i -D playwright`. The script falls back to
installed Chrome/Edge if Playwright's own browser isn't downloaded. Original-side
console errors about `{{ … }}` are x-dc runtime noise; ignore them.)

### 2. Plan (write it down, briefly)

Produce a short conversion map before coding and show it to the user in your reply.
Keep going unless they asked to review the plan first. (Running as a subagent with no
user to show it to? Keep it in your notes and include it in your final report.)

| # | Landmark | Component | Server/Client | Client leaves | Primitives | Notes |
|---|---|---|---|---|---|---|
| 2 | `section#top` | `HeroSection` | server | `HeroCanvas` (useNetCanvas) | Container, Heading, Button | LCP image, preload |
| 12 | `section#faq` | `FaqSection` | server | `FaqAccordion` (state: open index) | … | accordion a11y |

Also list: new tokens, new/extended primitives, assets to copy with their role names,
and the route. If this is not the first converted screen, note which existing pieces
(header, footer, primitives) are reused.

### 3. Foundation

In this order, because everything later depends on it:
0. **Tooling (first conversion only).** Make sure `eslint.config.mjs` ignores `screens/**` and
   `.claude/**`. The export's vendored React otherwise fails lint before you've written a
   line. Add `playwright` as a devDependency for the capture script.
1. **Tokens + breakpoints + fonts + base layer + keyframes + `@utility`s** in
   `globals.css`, and fonts in `layout.tsx` (conventions §3–6). Remove create-next-app
   leftovers.
2. **Assets** → `public/images/<screen>/<role-name>.<ext>`.
3. **Icons** → `src/lib/icons.ts` + `components/ui/Icon.tsx`.
4. **Primitives** → `components/ui` (Container, Heading, Button, IconTile, tones, …).
5. **Content** → `src/features/<screen>/content.ts`: extract every string and data array
   from the template text *and* from `renderVals()`, verbatim.

### 4. Sections, top to bottom

Build one landmark at a time as a Server Component in `sections/`, then add its
interactive leaves. For each:
- Translate the inline styles and helmet classes into Tailwind, using tokens where they
  exist and exact arbitrary values where they don't. Desktop-first media queries become
  mobile-first classes (conventions §4).
- Reproduce every state the export defines: `:hover`, `:focus-visible`, `:active`, the
  `sc-if` branches, and each `setState` path in the logic class. A converted page that
  looks right but whose tabs don't switch or cards don't lift on hover is broken.
- Port animations (keyframes → `animate-*`, transitions → `transition-*` with the same
  duration/easing) and canvas routines (→ hooks with full cleanup; x-dc-format "Imperative effects").
- Keep each file under ~200 lines; split sub-blocks into `components/`.

After every 3–4 sections, run the capture on the converted route to catch drift early,
while it's still cheap to fix:

```bash
npm run dev   # in the background
node .claude/skills/screen-to-nextjs/scripts/capture.mjs --original screens/<screen>/Main.dc.html --url http://localhost:3000/<route> --out <scratch>/capture
```

### 5. Compose the page

`src/app/<route>/page.tsx` imports the sections in export order inside `<main>`,
exports `metadata` (title from the export's `<title>`), and nothing else. The header and
footer go in the page, or in `layout.tsx` once a second screen shares them.

### 6. Verify, fix, repeat

1. `npx next typegen` (generates `LayoutProps`/`PageProps` types), then `npx tsc --noEmit`,
   `npm run lint`, `npm run build`. All must pass.
2. Full capture at `1440,1000,390`. Read `report.md`: landmark counts equal, heights
   within ~4%, 0px overflow, 0 converted-side console errors.
3. Inspect the pair images in `<out>/<width>/pairs/` (original left, converted right), starting
   with those the report ranks highest by pixel difference, and compare colour, type, spacing,
   alignment, radii, shadows and image crop. Look at every pair at 1440 and every pair with a
   noticeable diff score at the other widths. Fix, re-capture, and repeat until they read as the
   same design. Height drift almost always means a wrong line-height, padding or font. Chase it
   rather than accepting it (see "Tailwind v4 pitfalls" in conventions). Canvases with random
   particles always differ a little, and that's expected.

   **Bugs in the export itself.** Designs are drawn at desktop width, so the export sometimes
   breaks at phone width (text squeezed to one word per line, overlapping buttons). Fix those
   rather than faithfully reproducing them. The report will then flag that section as drifting,
   which is fine. List each deliberate deviation in the summary so the designer can confirm.
4. Exercise the interactions in the browser: click each tab, picker, accordion item and
   game control; tab through the page with the keyboard; check hover states. Playwright
   can drive this.
5. Walk `references/definition-of-done.md`. Where a group's standard is unclear, open the
   owning project skill (`.claude/skills/<name>/`) and follow it: `accessibility`,
   `performance-optimization`, `seo-metadata`, `animation-motion`, `component-architecture`,
   `design-tokens`, `figma-pixel-perfect`, `form-handling-validation`.

If no browser can be launched at all, say so plainly and list which widths/states
went unverified. Never imply a visual check passed when it didn't run.

### 7. Summary for the user

Keep it short and concrete:
- Route + files created (tree), which components are client and why.
- Tokens/primitives added (or reused, on later screens).
- Verification: capture table per width, what you fixed, and anything still different
  (with reason).
- Judgment calls: inferred states, links left as `#`, form submit TODOs, colours that fail
  contrast, breakpoint decisions.

## Re-syncing an updated export

If `screens/<screen>/` changed after conversion, re-run the inventory, diff it against
the current code (content.ts first, then per-section styles), and update in place. Don't
regenerate files wholesale, because that throws away fixes made since.
