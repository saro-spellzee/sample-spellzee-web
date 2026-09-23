# spellzee-web

The Spellzee marketing site. Designs come from Claude Design exports in `screens/` and are
turned into Next.js pages that match them at desktop, tablet and phone widths.

Live pages: `/` (homepage).

## Stack

- **Next.js 16** (App Router, `src/app`) with **React 19** and TypeScript
- **Tailwind CSS v4**, configured in CSS (`src/app/globals.css`, `@theme`). There is no `tailwind.config` file
- Fonts via `next/font/google`: Plus Jakarta Sans, Instrument Serif, Caveat
- Playwright (dev only), used for visual checks against the designs

> Next.js 16 has breaking changes compared to older versions. Before using an API you
> haven't used in this repo, check the bundled docs in `node_modules/next/dist/docs/`
> (see [AGENTS.md](AGENTS.md)). One example: `next/image` uses `preload` instead of `priority`.

## Getting started

Requires Node.js 20+ (developed on Node 24).

```bash
npm install
npm run dev        # http://localhost:3000
```

| Script | What it does |
|---|---|
| `npm run dev` | Dev server with hot reload |
| `npm run build` | Production build (the homepage is statically prerendered) |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint (ignores `screens/**` and `.claude/**`) |
| `npx tsc --noEmit` | Type-check. Run `npx next typegen` first on a fresh clone, so `LayoutProps`/`PageProps` exist |

> **Seeing no animations?** The site respects `prefers-reduced-motion`. If your OS has
> animations turned off (Windows: Settings → Accessibility → Visual effects → Animation
> effects), the page is intentionally static.

## Project structure

```
screens/<screen>/           Design exports from Claude Design (reference only, not app code)
  Main.dc.html              the design: markup, styles, behaviour
  assets/                   images used by the design
src/
  app/
    layout.tsx              fonts, <html lang>, site-wide metadata
    globals.css             design tokens (@theme), breakpoints, keyframes, custom utilities
    page.tsx                homepage: composes sections, exports metadata
  features/
    homepage/
      content.ts            ALL copy and list data for the page (typed in types.ts)
      sections/             one component per page section, in page order
      components/           pieces used only by the homepage (incl. interactive ones)
      hooks/                canvas animations (useNetCanvas, useBrainCanvas)
  components/ui/            shared primitives: Button, Container, Heading, Icon, IconTile, tones…
  lib/                      icons.ts (icon paths), cn.ts (class joining)
public/images/<screen>/     images, named by role (hero-child.jpg, logo.png…)
.claude/skills/             Claude Code skills with the team's frontend standards
```

## Conventions

The full rules are in [.claude/skills/screen-to-nextjs/references/conventions.md](.claude/skills/screen-to-nextjs/references/conventions.md). The essentials:

- **Server Components by default.** Only interactive leaves (tabs, accordion, games,
  canvases, forms) have `"use client"`, and sections stay on the server.
- **No hard-coded copy in JSX.** Text lives in the screen's `content.ts`, copied verbatim
  from the design. To change wording, edit `content.ts`.
- **Tokens, not hex codes.** Colours, radii, shadows and text sizes that recur are `@theme`
  tokens named by role (`text-ink`, `bg-brand`, `rounded-card`). Per-item colours go through
  **tones** (`tone: "rose"` → `components/ui/tones.ts`), which set `--tone`/`--tone-soft` CSS variables.
- **Breakpoints come from the design:** `sm` = 641px, `lg` = 1001px (phone-first classes).
- **Primitives take props, not class overrides.** Use `variant`/`size`/`tone` on `Button`,
  `Heading` and so on. A conflicting `className` won't reliably win.
- Files stay under ~200 lines. Split sub-blocks into `components/`.

## Adding or updating a screen from a design

1. Export the screen from Claude Design and put the folder in `screens/<screen>/`
   (with `Main.dc.html` and `assets/`). Commit it.
2. In Claude Code, ask for the conversion, e.g. *"convert screens/pricing"*. The
   [`screen-to-nextjs`](.claude/skills/screen-to-nextjs/SKILL.md) skill takes it from there:
   - inventories the design,
   - reuses the existing tokens and primitives,
   - builds the sections,
   - verifies the result against the design with screenshots.

   For an updated export of an existing screen, ask it to *re-sync* instead. It updates
   the code in place.
3. Review what it reports: routes, deliberate differences from the design, links without a
   real destination, and colours that fail contrast.

`screens/homepage` maps to `/`, and any other `screens/<name>` maps to `/<name>`.

### Visual check by hand

```bash
npm run dev
node .claude/skills/screen-to-nextjs/scripts/capture.mjs \
  --original screens/homepage/Main.dc.html --url http://localhost:3000/ --out .capture
```

This writes `.capture/report.md` (section heights, pixel-difference scores, overflow, console
errors) and side-by-side images in `.capture/<width>/pairs/`. The widths are 1440, 1000 and
390. The script uses Playwright's Chromium if it's installed, and otherwise falls back to
local Chrome or Edge.

## Open items on the homepage

- **Placeholder links:** CTA buttons point at `#cta`, footer Contact/Privacy/Terms/Refund/Parent
  Resources point at `#top`, and program cards link to routes that don't exist yet (`/phonics`…).
- **Newsletter form:** no backend yet. Submit only resets the form.
- **Story "Play" button:** no video wired up.
- **`metadataBase`** in `layout.tsx` is `https://spellzee.in`. Confirm the production domain.
- **Contrast:** some design colours fail WCAG AA (e.g. program numbers "01–04" at 2.2:1).
  They're kept as designed, pending a design decision.

## Team skills

`.claude/skills/` holds Claude Code skills that encode the team's standards (accessibility,
performance, SEO, component architecture, design tokens, testing and more). Claude Code picks
them up automatically in this repo. Each has a `references/definition-of-done.md` checklist
that is useful for human review too.
