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
.claude/agents/             Phase agents used by the ship-screen pipeline
.quality/<screen>/          Pipeline reports, audits, captures (gitignored)
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
2. In Claude Code run `/screen-to-nextjs <screen>` (or `/ship-screen <screen>`, or just say
   *"convert screens/pricing"*). This starts the **ship-screen pipeline**: it creates the
   branch `feat/<screen>` and runs the phases below in order. Each phase runs in its own
   subagent, fixes what it finds, leaves the build green and is committed separately.

   | # | Phase | What it guarantees |
   |---|---|---|
   | 0 | Pre-flight | Clean tree, feature branch, test tooling installed (first run only) |
   | 1 | Convert | Code matches the design at 1440/1000/390 ([screen-to-nextjs](.claude/skills/screen-to-nextjs/SKILL.md)) |
   | 2 | Build gate | typegen, tsc, lint, production build |
   | 3 | Tests | Vitest + Testing Library + axe per client component, Playwright E2E |
   | 4 | Structure | Component boundaries, tokens instead of hex, strict types, no hard-coded copy |
   | 5 | Accessibility | axe WCAG 2.2 AA in a real browser, keyboard walkthrough, reduced motion |
   | 6 | Performance | Lighthouse budgets on mobile and desktop (LCP, CLS, TBT) |
   | 7 | SEO / GEO / AEO | Metadata, JSON-LD from content, sitemap, llms.txt, working links |
   | 8 | Forms | RHF + Zod with server re-validation (only if the screen has forms) |
   | 9 | Security | Security headers, a CSP that keeps pages static, XSS sinks, npm audit |
   | 10 | Error handling | error / global-error / not-found pages, soft-failing widgets |
   | 11 | Code review | Independent read-only review of the whole diff; must-fixes applied |
   | 12 | Final regression | Everything above re-run together, nothing broke |
   | 13 | Report | `.quality/<screen>/REPORT.md` plus the decisions only you can make |

   It never pushes or merges. Review the branch, then merge it yourself.
3. Answer the **decisions needed** it lists: colours that fail contrast (with proposed
   replacements), links to pages that don't exist yet, backend endpoints, legal copy.

Useful variants:

```
/ship-screen homepage --no-convert             # harden an already-converted screen
/ship-screen pricing --from a11y               # resume an interrupted run
/ship-screen about --only perf,seo             # re-run specific phases
/ship-screen about --budget mobile.perf=85     # different Lighthouse budget
/screen-to-nextjs pricing convert only         # conversion without the pipeline
```

For an updated export of an existing screen, run the pipeline again: the convert phase
re-syncs the code in place instead of regenerating it.

`screens/homepage` maps to `/`, and any other `screens/<name>` maps to `/<name>`.

### Running the checks by hand

```bash
S=.claude/skills/ship-screen/scripts
node $S/gates.mjs --tests     # typegen, tsc, lint, build, unit + e2e tests
node $S/audit.mjs --routes / --original screens/homepage/Main.dc.html --out .quality/manual
                              # console, links, axe, headers, Lighthouse, design capture
node $S/scan.mjs --paths src  # static scan: big files, hex, any, XSS sinks, hard-coded copy
```

`audit.mjs` starts `next start` on the current build by itself (run `npm run build` first).
Results land in `.quality/`, which is gitignored. Browsers: Playwright's Chromium if
installed, otherwise local Chrome or Edge.

## SEO, GEO and AEO

Everything uses the Next.js Metadata API and is prerendered at build time. Brand facts and the
domain live in `src/lib/site.ts`.

| What | Where | For |
|---|---|---|
| Title, description, canonical, Open Graph, Twitter, robots directives | `src/app/layout.tsx`, `src/app/page.tsx` | Search results, social previews |
| Branded 1200×630 share card | `src/app/opengraph-image.tsx`, `twitter-image.tsx` (`_og/social-card.tsx`) | WhatsApp, LinkedIn, X previews |
| Favicon, apple icon, web manifest | `src/app/icon.tsx`, `apple-icon.tsx`, `manifest.ts` | Browser tab, home screen |
| `robots.txt`, `sitemap.xml` | `src/app/robots.ts`, `sitemap.ts` | Crawling and indexing. AI crawlers are explicitly allowed |
| JSON-LD: Organization, WebSite, WebPage, CLM `DefinedTerm`, `FAQPage` | `src/features/homepage/structured-data.ts` | Rich results; entity understanding for AI answers |
| `/llms.txt` | `src/app/llms.txt/route.ts` | A markdown brief for AI assistants (GEO) |

Structured data and `llms.txt` are **generated from `content.ts`**, so they always match the page.
When you add a route, add it to `sitemap.ts`. When you add a screen with FAQs or offers, extend its
structured data the same way. Validate with the
[Rich Results Test](https://search.google.com/test/rich-results) and
[Schema Markup Validator](https://validator.schema.org/) once the site is live.

## Open items on the homepage

- **Placeholder links:** CTA buttons point at `#cta`, footer Contact/Privacy/Terms/Refund/Parent
  Resources point at `#top`, and program cards link to routes that don't exist yet (`/phonics`…).
- **Newsletter form:** no backend yet. Submit only resets the form.
- **Story "Play" button:** no video wired up.
- **Site URL** is `https://spellzee.in` in `src/lib/site.ts` (override with `NEXT_PUBLIC_SITE_URL`).
  Confirm the production domain, and add official social profiles to `site.sameAs`.
- **Contrast:** some design colours fail WCAG AA (e.g. program numbers "01–04" at 2.2:1).
  They're kept as designed, pending a design decision.

## Team skills

`.claude/skills/` holds Claude Code skills that encode the team's standards (accessibility,
performance, SEO, component architecture, design tokens, testing and more). Claude Code picks
them up automatically in this repo. Each has a `references/definition-of-done.md` checklist
that is useful for human review too.
