# spellzee-web conventions for converted screens

Stack: Next.js 16 App Router (`src/app`), React 19, TypeScript, Tailwind CSS v4
(CSS-first config: `@import "tailwindcss"` + `@theme` in `src/app/globals.css`;
there is **no** `tailwind.config.*`, so don't create one).
If anything here disagrees with `node_modules/next/dist/docs/`, the docs win.

## Contents
1. Folder layout
2. Routes
3. Tokens (`@theme`)
4. Breakpoints (and a mobile board)
5. Fonts
6. Custom CSS: utilities, keyframes, base
7. Content (`content.ts`)
8. Colour roles ("tones")
9. Icons
10. Images and assets
11. Server vs client components
12. Shared UI primitives
13. Metadata
14. Safari (iPhone)

## 1. Folder layout

```
src/
  app/
    layout.tsx                  fonts, <html lang>, site-wide metadata defaults
    globals.css                 @theme tokens, @utility, keyframes, base layer
    page.tsx                    homepage route: composes sections, exports metadata
    <screen>/page.tsx           other screens
  features/
    <screen>/
      content.ts                all copy + list data for the screen (typed)
      types.ts                  content types (if content.ts gets long)
      sections/                 one file per landmark, in page order
        HeroSection.tsx
        FaqSection.tsx
      components/               pieces used by this screen only
        FaqAccordion.tsx        ("use client" leaves live here)
      hooks/
        useNetCanvas.ts
  components/
    ui/                         design-system primitives, used by 2+ screens
      Button.tsx  Container.tsx  Heading.tsx  Icon.tsx  IconTile.tsx  Card.tsx
    layout/                     SiteHeader.tsx, SiteFooter.tsx once shared by 2+ screens
  lib/
    icons.ts                    icon path table (typed name union)
    cn.ts                       class-joining helper, only if needed
public/
  images/<screen>/              assets from screens/<screen>/assets, renamed by role
```

Dependency direction: `app → features → components/ui → lib`. A feature never
imports another feature's internals; if two screens need the same piece, promote it
to `components/`. `components/ui` never imports from `features`.

Component size: aim for ≤ ~150–200 lines per file (project rule from
`component-architecture`). Most x-dc sections are 30–90 template lines. The ones with
several loops (e.g. a "classroom" section with tabs + game + materials) split into a
section shell plus one component per sub-block.

## 2. Routes

`screens/homepage` → `src/app/page.tsx` (route `/`). Any other `screens/<name>` →
`src/app/<kebab-name>/page.tsx`. If the folder name doesn't obviously map to a URL
(e.g. `screens/pricing-v2`), ask the user for the route.

The first conversion replaces the create-next-app placeholder in `src/app/page.tsx`
and `layout.tsx` (Geist fonts, "Create Next App" metadata, dark-mode colour swap).

## 3. Tokens (`@theme`)

Run the inventory script first: its "Token candidates" section is a frequency list.
Promote values to tokens by frequency and role, not every value:

```css
@theme {
  /* brand + text */
  --color-ink: #0E1A3A;          /* primary text (×38) */
  --color-ink-soft: #4B5575;
  --color-brand: #1557D6;        /* links, primary buttons (×41) */
  --color-brand-hover: #0F45AE;
  --color-cream: #FCF8F4;        /* page background */
  --color-line: #ECE4D9;         /* hairlines/borders */
  /* tones: see section 8 */
  --color-tone-blue: #1557D6;   --color-tone-blue-soft: #E3ECFE;
  --color-tone-rose: #D0335F;   --color-tone-rose-soft: #FCE3EC;
  …
  /* radius, shadow, type scale that recur */
  --radius-card: 22px;
  --shadow-card: 0 20px 40px -28px rgb(70 45 20 / .45);
  --text-body: 14.5px;  --text-body--line-height: 1.7;
}
```

- Name by role (`ink`, `brand`, `line`), not by value (`blue-600`). Components use
  `text-ink`, `bg-brand`, `rounded-card`, `shadow-card`.
- A value used once or twice in one spot may stay an arbitrary value (`tracking-[-0.035em]`).
  That's fine and honest. A hex used in 3+ places is a token.
- Keep exact values. Don't snap `#1557D6` to `blue-700`: the design is the spec.
- On the 2nd+ screen: **reuse existing tokens**; add only genuinely new ones. If a
  new screen's colour is within a hair of an existing token, it's almost certainly the same
  token (designer drift). Use the token and mention it in the summary.
- The site is a single light theme; the default create-next-app dark-mode swap should go.
  Don't invent a dark mode the design doesn't have (`design-tokens` covers that if it's ever needed).

## 4. Breakpoints

x-dc exports are desktop-first (`@media (max-width:1000px)`, `(max-width:640px)`).
Tailwind is mobile-first. Encode the design's real breakpoints once, then write
phone-first classes:

```css
@theme {
  --breakpoint-*: initial;       /* drop Tailwind defaults that don't match the design */
  --breakpoint-sm: 40.0625rem;   /* 641px: above the export's 640px phone query */
  --breakpoint-lg: 62.5625rem;   /* 1001px: above the export's 1000px tablet query */
  --breakpoint-xl: 90rem;        /* 1440px: design canvas width, if anything needs it */
}
```

Styles outside media queries = desktop → `lg:` classes. The `max-width:1000px` block =
tablet → `sm:` classes (or base if it also applies to phone). The `max-width:640px` block
→ base (unprefixed). If a later screen's export uses different breakpoints, reconcile with
the user rather than adding a second set.

Without a mobile board, also design what the export didn't: check every section at 390px.
Grids collapse, absolute-positioned decorations may need hiding (`max-sm:hidden`), long
headings need smaller type, and nothing may cause horizontal scroll.

### With a mobile board

When `boards.mjs` lists a phone reference board (x-dc-format, "Several boards"), the base
(unprefixed) classes come from **the mobile board**. `lg:` still comes from the desktop board,
and `sm:` from a tablet board if there is one, otherwise from the desktop board's
`max-width:1000px` rules. Where the desktop board has no rule for the tablet band, use the
nearer board's layout and list the choice. The breakpoint tokens stay as they are.

Work landmark by landmark, with both boards open at the inventory's line ranges:

- **Same content, different layout** (stacked columns, a reordered section, a grid that
  becomes a swipe row): one DOM, responsive classes (`flex-col lg:flex-row`, `order-*`,
  `grid-flow-col overflow-x-auto snap-x lg:grid-flow-row`). Don't render the section twice.
- **Different structure** (inline nav vs a hamburger drawer, a table vs cards): two variants
  are fine. Both render from the same `content.ts` entries, and the unused one is
  `display:none` at that width (`hidden lg:flex` / `lg:hidden`), so screen readers, Tab
  order and search see one copy. Never hide with opacity or off-screen positioning.
- **On only one board**: mobile-only elements (hamburger, sticky bottom CTA, "show more")
  are hidden from the width where the desktop layout takes over (`sm:hidden` / `lg:hidden`).
  Desktop-only decorations get `max-sm:hidden`.
- **A landmark missing from the mobile board**: don't drop content silently. Keep it, laid
  out by the desktop board's phone rules, and put it under DECISIONS NEEDED ("`#cta` isn't
  on the mobile board: kept; hide it on phones?"). The capture reports a landmark-count
  difference at 390. List it as a deliberate deviation.
- **Different copy** (a shorter heading on mobile): both strings go verbatim into
  `content.ts` as explicit fields (`title`, `titleShort`) and use the visibility classes
  above. If the difference looks like drift rather than intent (one word changed), use the
  desktop string and list it.
- **Different image** (the inventory's "Images only on …", usually a mobile crop): art
  direction with `getImageProps` + `<picture>` (Next docs
  `03-api-reference/02-components/image.md`, "Art direction"), so each viewport downloads
  only its own image. Don't use two `next/image` elements toggled with CSS.
- **Different type scale**: the mobile board's font sizes become the base classes. A heading
  role that changes size goes into the `Heading` primitive (`text-[30px] lg:text-[46px]`),
  not into every section.
- **Different behaviour** (a carousel on mobile, a static grid on desktop): switch with CSS
  where possible (scroll-snap needs no JS). If JS must know the width (auto-advance only on
  mobile), gate the effect with `matchMedia` and render the same markup on the server, so
  hydration doesn't shift the layout.

## 5. Fonts

Replace the helmet's Google Fonts `<link>` with `next/font/google` in `layout.tsx`,
exposed as CSS variables and wired into `@theme`:

```tsx
const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], weight: ["400","500","600","700","800"], variable: "--font-jakarta" });
const serif = Instrument_Serif({ subsets: ["latin"], weight: "400", style: ["normal","italic"], variable: "--font-instrument" });
const hand = Caveat({ subsets: ["latin"], weight: ["500","600"], variable: "--font-caveat" });
```
```css
@theme inline {
  --font-sans: var(--font-jakarta), system-ui, sans-serif;
  --font-serif: var(--font-instrument), Georgia, serif;
  --font-hand: var(--font-caveat), cursive;
}
```

Load exactly the weights/styles the export requests, no more (each is a download).

## 6. Custom CSS: utilities, keyframes, base

One styling approach: Tailwind. Put CSS in `globals.css` only for what utilities
can't express cleanly:

```css
@layer base {
  html { scroll-behavior: smooth; }
  body { @apply bg-cream text-ink font-sans antialiased; line-height: normal; } /* see "line-height" below */
  a { @apply text-brand hover:text-brand-hover; }
}

@utility silk {             /* textured background used by 5 sections */
  background-color: var(--color-cream);
  background-image: url(/images/homepage/silk-texture.jpg);
  background-size: cover; background-position: center; background-repeat: no-repeat;
}
@utility gradient-border {  /* the .clm-badge padding-box/border-box trick */
  border: 1.5px solid transparent;
  background: linear-gradient(#fff,#fff) padding-box, linear-gradient(90deg,#2F6BF2,#8B4FE8,#D0508F) border-box;
}

@theme {
  --animate-floaty: floaty 6s ease-in-out infinite;
  @keyframes floaty { 0%,100% { transform: translate(-50%,-50%) } 50% { transform: translate(-50%, calc(-50% - 6px)) } }
}
```

### Tailwind v4 pitfalls that cause visual drift (all hit in real conversions)

- **line-height.** Preflight sets `line-height: 1.5` on the page, but x-dc exports inherit
  the browser's `normal`. Set `line-height: normal` on `body` (above). Also, the named text
  sizes (`text-sm`, `text-base`, `text-lg`…) **set a line-height too**. When the export sets
  only `font-size`, use `text-[14px]` (arbitrary sizes carry no line-height), or pair explicitly
  (`text-sm/[normal]`). This single issue caused nearly all of the height drift in the first conversion.
- **translate vs. keyframe transform.** `-translate-x-1/2` etc. set the separate CSS
  `translate` property, which *stacks* with a keyframe that animates `transform` (like
  `floaty` above), giving a double offset. On elements whose animation moves `transform`,
  position with `[transform:translate(-50%,-50%)]` (or let the keyframe own the offset),
  not `translate-*` utilities.
- **className overrides don't win by order.** Two conflicting utilities (`px-4` from a
  primitive, `px-6` from the caller) resolve by stylesheet order, not by the order you wrote
  them. Give primitives explicit `variant`/`size`/`tone` props that *replace* defaults, and keep
  caller `className` for layout (margin, grid placement). If free-form overrides are really needed,
  add `tailwind-merge` to `cn()` rather than hoping.

Rule of thumb: if an element needs more than ~6 arbitrary-value classes, or the
same bundle of declarations appears in 2+ places, it's an `@utility` or a primitive
component. Don't write one-off CSS classes per element, and don't use CSS modules
(that would mix two styling approaches).

## 7. Content (`content.ts`)

All user-visible copy and list data lives in `src/features/<screen>/content.ts`.
Components receive it via props or import it in the section (Server Component).
Nothing user-visible is hard-coded in JSX. That keeps copy editable in one place
and makes a later move to i18n (`i18n-l10n` skill) mechanical.

```ts
import type { IconName } from "@/lib/icons";
import type { Tone } from "@/components/ui/tones";

export type Faq = { id: string; question: string; answer: string; showSteps?: boolean };

export const faq = {
  eyebrow: "FAQ",
  title: "Frequently asked questions",
  items: [
    { id: "what-is-clm", question: "…", answer: "…", showSteps: true },
  ] satisfies Faq[],
} as const;
```

- Copy text **verbatim** from the export, including typographic quotes (’ “ ”), em dashes,
  ™, and the `&amp;` → `&` decoding. Don't "improve" marketing copy.
- Rich headings (a span with an accent colour, a `.mark` swoosh on one word) → model the
  parts: `title: { before: "Let’s help your child ", highlight: "read, write and speak", after: " with confidence." }`.
  Don't put HTML strings in content, and don't use `dangerouslySetInnerHTML`.
- Give list items stable `id`s for React keys. Index keys are acceptable only for static lists.
- Links/CTAs: keep `href` from the export. Anchors like `#programs` must match a section `id`.
  If a CTA's destination is `#` or missing, keep `#` and list it in the summary as needing a real URL.

## 8. Colour roles ("tones")

x-dc data carries colour pairs per item (`c: '#1557D6', bg: '#E3ECFE'`), and the
template uses them in many ways: text, fills, borders, alpha variants (`c + '22'`),
and hover swaps to the solid colour. Tailwind can't build class names from runtime
strings, so don't do `bg-[${item.bg}]`. Instead, a tone **sets two CSS variables**
on the element, and descendants consume them with static classes:

```ts
// src/components/ui/tones.ts
export const tones = {
  blue: "[--tone:var(--color-tone-blue)] [--tone-soft:var(--color-tone-blue-soft)]",
  rose: "[--tone:var(--color-tone-rose)] [--tone-soft:var(--color-tone-rose-soft)]",
  …
} as const;
export type Tone = keyof typeof tones;
```
```tsx
<li className={cn(tones[item.tone], "bg-(--tone-soft) text-(--tone) hover:bg-(--tone) hover:text-white border-(--tone)/15")}>
```

This covers alpha (`bg-(--tone)/10`), borders, hovers and nested children with one
mechanism. Content then says `tone: "rose"`. Name tones by hue, and add a new tone rather
than approximating: exports often carry near-duplicate pairs that differ on purpose. Continuous values (a progress bar's `v: 72`) go through
`style={{ width: `${v}%` }}` or a CSS variable, which is the legitimate use of inline style.

## 9. Icons

The logic class's `const I = { calendar: 'M…', … }` table → `src/lib/icons.ts`:

```ts
export const iconPaths = { calendar: "M…", refund: "M…" } as const;
export type IconName = keyof typeof iconPaths;
```

and one `<Icon name="calendar" className="size-5" />` component (in `components/ui`) that
renders the `<svg>` with the export's `viewBox`/stroke settings, `aria-hidden` by default,
and accepts a `title` when the icon carries meaning. Inline one-off SVGs in the markup
(logos, decorative waves) can stay inline JSX in their component. Convert attributes
(`stroke-width` → `strokeWidth`, etc.).

## 10. Images and assets

- Copy `screens/<screen>/assets/*` to `public/images/<screen>/` with **role names**
  (`hero-child.jpg`, `logo.png`, `silk-texture.jpg`), not hashes. The inventory's asset table gives
  dimensions, alt text and where each is used. Skip files the inventory marks UNUSED.
  A mobile board's `assets/` usually repeats the same hashed files. Copy each file once, and
  give an image that only the mobile board uses a `-mobile` role name (`hero-child-mobile.jpg`,
  art direction per §4).
- Use `next/image` with the intrinsic `width`/`height` from the inventory (or `fill` + a sized
  parent) and a `sizes` attribute that reflects the rendered width at each breakpoint.
- The hero/LCP image gets `loading="eager"` + `fetchPriority="high"`. Next 16 deprecated
  `priority`, and its `preload` prop emits a `<link>` without `fetchpriority` that competes
  with other preloads (Lighthouse "LCP request discovery" fails). Only that one image is high
  priority; header logos etc. stay default.
- Above-the-fold text (hero `h1`/lead) must not start at `opacity: 0`: Chrome ignores
  invisible paints for LCP, so a fade-in hero pushes LCP onto another element. Use a
  transform-only entrance (`animate-rise`) for the hero, and keep fade-ups for content below the fold.
  Everything else lazy-loads by default.
- `alt` text comes from the export verbatim. Decorative images get `alt=""`.
- Images used as CSS backgrounds (`.silk`) stay CSS backgrounds via `@utility`, referenced by `/images/…` path.

## 11. Server vs client components

Default everything to Server Components. Add `"use client"` only to the leaf that
owns state, handlers, effects or browser APIs, and keep the static section markup
around it on the server:

```
FaqSection.tsx (server)        heading, intro, CTA, layout
  └─ FaqAccordion.tsx ("use client")   useState(openIndex), buttons, panels
```

Props passed server → client must be serialisable: content objects, tone names and icon
names are fine; functions and components are not. Canvas hooks are only called from client components.

## 12. Shared UI primitives

Build these first (they appear across nearly every section), in `components/ui/`:

- `Container`: the `.wrap` max-width + gutters.
- `Heading`: the `.h1`/`.h2` visual styles, **decoupled from level** (`<Heading as="h2" size="display">`),
  because the export styles several `<h2>`s with the `.h1` look. Keep the export's real heading levels.
- `Button`: `.btn`/`.btn-primary`/`.btn-ghost`/`.btn-sm` as `variant`/`size` props; renders
  `next/link` when given `href`, `<button>` otherwise. Include hover/focus-visible/active states.
- `IconTile`: the recurring coloured square/circle with an icon (`tone`, `icon`, `size`).
- `Card`, `Eyebrow`/`Kicker`, `Lead`: only if they recur.

Reuse existing primitives on later screens; extend them with a variant rather than cloning.

## 13. Metadata

`page.tsx` exports `metadata` (or `generateMetadata`) with the export's `<title>` and a
description written from the hero copy, plus Open Graph basics. Site-wide defaults
(`metadataBase`, title template) go in `layout.tsx`. See the `seo-metadata` skill.

## 14. Safari (iPhone)

Many parents open the site on an iPhone, so the pipeline checks Safari's engine (WebKit)
in the E2E `iphone` project and in the audit's `webkit` check. The support floor is **iOS
Safari 16.4+**: Tailwind v4 relies on `@property`, `color-mix()` and cascade layers, so
older iOS shows parts of the page unstyled. Build for these differences:

- **Viewport height:** `100vh` includes the area under Safari's collapsing toolbar. Use
  `h-svh` / `min-h-dvh` for full-screen heroes, drawers and modals.
- **Inputs under 16px zoom the page** when focused. Inputs, selects and textareas need at least
  `text-base` (16px) at phone width, even if the board draws them smaller. List that as a
  deviation.
- **A tap before hydration is lost.** Essentials such as forms must work without JS, with a
  Server Action as the form's `action`.
- **Buttons don't get focus on click.** Don't open or close menus and tooltips from
  `:focus` / `onFocus` / `onBlur` alone. Drive them with state from the click, and close on
  Escape and on an outside tap.
- **Hover:** iOS turns the first tap into a hover. Anything shown only on hover needs a tap
  path too. Keep hover-only styling under `@media (hover: hover)` (Tailwind's `hover:`
  variant already does this in v4).
- **`position: sticky`** stops working inside an ancestor with `overflow: hidden` or
  `overflow: auto`. Use `overflow-x-clip` on the ancestor instead: clip doesn't create a
  scroll container.
- **`backdrop-filter`** in hand-written CSS (`@utility`) also needs `-webkit-backdrop-filter`.
  Tailwind's utilities already add the prefix.
- **Newer CSS** (`text-wrap: balance` is iOS 17.5+, for example) is fine as an enhancement
  that degrades quietly. Don't let the layout depend on it.
- **Tab order:** Safari leaves links out by default. That's a user setting, not a bug.

Test artefacts, not bugs (Playwright's WebKit on Windows):
- Text looks thinner in WebKit screenshots. The Windows build rasterises fonts differently;
  the weights are loaded and applied (check `document.fonts`). Judge Safari by layout,
  errors and behaviour, not by glyph weight.
- On `http://localhost`, WebKit upgrades every request to https because of the CSP's
  `upgrade-insecure-requests`. The E2E fixture and the audit strip that one directive
  locally, so don't remove it from the CSP.
