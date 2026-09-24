# Reading a Claude Design (x-dc) export

A `screens/<screen>/` folder is an export from the Claude Design canvas. It is a
**reference mockup**: the values are exact, the code is not production code.
Replicate the values; do not port the runtime.

```
screens/<screen>/
  Main.dc.html   the desktop board: <x-dc> template + logic class ← source of truth at desktop width
  mobile/        optional: the mobile board's own export          ← source of truth at phone width
  assets/        uploaded images/svg/fonts, hashed filenames      ← copy, renamed by role
  support.js     x-dc runtime                                     ← ignore
  vendor/        react.js / react-dom.js for the runtime          ← ignore
  README.md      export notes                                     ← read once
```

A screen can have more than one board (mobile, tablet, states): see "Several boards" below.

## Anatomy of Main.dc.html

```html
<x-dc>
  <helmet>
    <link href="https://fonts.googleapis.com/css2?family=…">   → next/font/google
    <style> body{…} .card{…} @keyframes…{…} @media…{…} </style> → @theme tokens, @utility, keyframes
  </helmet>
  <header>…</header>
  <section id="top">…</section>                                  → one section component each
  …
  <footer>…</footer>
</x-dc>
<script type="text/x-dc" data-dc-script data-props='{"$preview":{"width":1440,…}}'>
class Component extends DCLogic { … }                           → content.ts + client leaf components
</script>
```

`$preview.width` is the width the board was drawn at: 1440 for a desktop board, ~390 for a
mobile board.

## Several boards: mobile, tablet, states

The design team may draw one screen several times on the canvas: a desktop board, a mobile
board, sometimes a tablet board, and **state boards** that show one widget in another state
(menu open, a later quiz step). Each exported board is its own `*.dc.html`. They arrive as
extra `.dc.html` files in the export, as a folder inside it (`screens/<screen>/mobile/`),
or as a sibling export (`screens/<screen>-mobile/`, also `-tablet`/`-phone`/`-desktop`).
A sibling folder belongs to that screen; it is not a screen of its own.

```bash
node .claude/skills/screen-to-nextjs/scripts/boards.mjs screens/<screen>
```

This prints every board with its width and role, and which board each capture width is
compared with: the nearest drawn width, so with a 390 mobile board 1440 and 1000 go to
desktop and 390 goes to mobile. `inventory.mjs` and `capture.mjs` find the boards
themselves, so their commands don't change.

- **Reference board**: the spec at its width. Where a mobile board and the desktop board's
  `@media (max-width:640px)` rules disagree, the mobile board wins. The designer drew it
  deliberately, whereas the media query was only a fallback.
- **State board** (same width as a reference board): the spec for that one state, e.g. the
  drawer the hamburger opens. To have it checked automatically, add an entry to
  `tests/design-states/<screen>.json`: the board, the width, the steps that reach the state
  on the built page, and `"mode": "viewport"` for overlays like a drawer or modal.
  ```json
  { "states": [
    { "board": "mobile/Menu-open.dc.html", "width": 390, "mode": "viewport",
      "steps": [ { "click": "button[aria-controls='site-menu']" } ] }
  ] }
  ```
  The capture then compares that state every time it runs: in the converter's loop, in every
  phase's regression check and in final. Steps are `click`, `hover`, `focus`, `press` (a
  key), `scroll` (a selector into view) and `wait` (ms), and they only run on the built page.
  A state board with no entry is reported as "not checked".
- **Each board has its own logic class.** Usually they match. Different data (fewer items,
  shorter strings) shows up in the inventory's "Copy only on …" lines. Different behaviour
  (a carousel on mobile, a grid on desktop) means one widget owns both.
- All boards describe **one page**: one route, one DOM, one `content.ts`. How a second
  board maps onto the same components: conventions §4, "With a mobile board".

## Template syntax → React

| x-dc | Meaning | React / Next equivalent |
|---|---|---|
| `{{ expr }}` in text | binding into `renderVals()` result | `{item.t}` from content/props |
| `style="color: {{ st.c }}"` | dynamic inline style | a **variant/tone prop** mapped to static Tailwind classes; fall back to a CSS variable (`style={{ "--tone": … }}`) only for truly continuous values (percentages, angles) |
| `<sc-for list="{{ faqs }}" as="fq">…</sc-for>` | loop | `{faqs.map((fq) => <FaqItem key={fq.id} … />)}`; the loop body usually becomes its own component |
| `hint-placeholder-count="13"` | editor hint (how many to preview) | ignore; the real count comes from the data |
| `<sc-if value="{{ fq.open }}">` | conditional render | `{open && …}` |
| `hint-placeholder-val="{{ false }}"` | editor hint | ignore |
| `onClick="{{ fq.toggle }}"` (also onMouseEnter, onFocus) | handler from `renderVals()` | a handler in a `"use client"` leaf component |
| `ref="{{ heroCanvas }}"` + `this.refFn('heroCanvas')` | DOM ref for imperative code | `useRef` inside a custom hook |
| `aria-expanded="{{ fq.expanded }}"` | string-ified boolean | `aria-expanded={open}` |
| `class="…"` | classes from the helmet stylesheet | Tailwind utilities / `@utility` (see conventions) |

## The logic class

```js
class Component extends DCLogic {
  constructor()          → initial state: this.state = { faq: 0, tab: 0, … }
  componentDidMount()    → starts imperative effects (canvas animation, observers, timers)
  componentWillUnmount() → cleanup for those effects
  net(), brainNet()…     → imperative drawing routines        → custom hooks (useXCanvas)
  refFn(key)             → ref plumbing                        → useRef
  renderVals()           → builds EVERYTHING the template binds:
     const I = {…}                 icon path table              → icons.ts + <Icon name>
     const faqData = [[q, a], …]   raw content arrays           → content.ts (typed)
     const faqs = faqData.map(…)   content + derived UI state   → split: data → content.ts,
                                   (open, rot, wrapBg, toggle)     state → client component
     return { faqs, ledger, … }    the binding namespace
}
```

The most important move is **splitting `renderVals()`**: it mixes three things that
belong in three places:

1. **Static content** (strings, numbers, list items, icon names, colour roles) →
   `src/features/<screen>/content.ts`, typed, serialisable.
2. **Derived presentation** (`rot: open ? 'rotate(180deg)' : …`, `wrapBg: open ? '#fff' : tint`)
   → conditional Tailwind classes inside the component that owns the state
   (`open ? "rotate-180 bg-white" : "bg-(--tint)"`), not precomputed strings.
3. **State + handlers** (`this.state.faq`, `toggle: () => this.setState(…)`) → `useState`
   in the smallest client component that needs it. Each `this.state` key usually belongs
   to exactly one widget. Give each widget its own component and state, never one page-level store.

**State survives `sc-if`.** In x-dc all state lives in the one logic class, so a tab
panel hidden by `<sc-if>` keeps its state (a half-played game, a picked answer) when
you switch back. If you give each panel its own `useState` and unmount it with
`{isBlend && <BlendGame/>}`, switching tabs silently resets it. Keep stateful panels
mounted and hide them (`hidden={!active}`), or lift their state into the tab container.

**Timers and "last interaction" tracking.** The logic class often records
`Date.now()` in handlers to pause auto-advance after a user touches something. React's
compiler lint (`react-hooks/purity`, on in this project) rejects impure calls during render.
Read time inside handlers/effects only: compare `event.timeStamp` with `performance.now()`,
or store a ref in the handler and read it inside the interval callback.

Read each `setState` call to learn the widget's full behaviour: cycling (`% length`),
toggling (`open ? -1 : i`), resetting, and auto-advance via `setInterval` in
`componentDidMount`. Reproduce every one of them, including auto-advance timers
(with cleanup, and paused under reduced motion if they animate).

## Imperative effects (canvas, observers, timers)

`componentDidMount` often starts `requestAnimationFrame` loops on `<canvas>`
elements, `IntersectionObserver` visibility gating, pointer listeners, `ResizeObserver`
and `devicePixelRatio` scaling. Port each routine as a hook:

```tsx
"use client";
export function useNetCanvas(canvasRef: RefObject<HTMLCanvasElement | null>, hostRef: …) {
  useEffect(() => {
    // body of net() almost verbatim; it is already framework-free drawing code
    // keep: IntersectionObserver pause, reduced-motion check, DPR scaling
    return () => { cancelAnimationFrame(raf); io?.disconnect(); ro?.disconnect(); host.removeEventListener(…) };
  }, []);
}
```

Keeping the drawing math verbatim is correct here. It is tuned artwork, and rewriting it
risks visual drift. What must change is lifecycle: every listener, observer, timer and
rAF gets cleaned up in the effect's return, and nothing touches `window`/`document`
outside an effect (Server Component render and hydration would break). Canvases are
decorative: `aria-hidden="true"`, and a static fallback (the section still reads
correctly with the canvas blank, e.g. under reduced motion).

## The helmet stylesheet

- `body{…}`, `a{…}`, `*{box-sizing}`, `html{scroll-behavior}` → `@layer base` in globals.css.
- Layout helpers (`.wrap`, `.g2/.g3/.g4`, `.h1/.h2`, `.lead`, `.kicker`, `.btn*`, `.card`, `.tile`)
  → shared UI primitives (`Container`, `Grid`, `Heading`, `Button`, `Card`, `IconTile`),
  not global classes.
- Bespoke multi-declaration effects (texture backgrounds, gradient borders, underline swooshes)
  → Tailwind v4 `@utility name { … }` in globals.css.
- `@keyframes` → inside `@theme` with a matching `--animate-*` token.
- `@media (max-width:1000px)` / `(max-width:640px)` are **desktop-first max-width** queries.
  Tailwind is mobile-first: rewrite as base = phone styles, then `min-[641px]:`/`sm:`… up to
  `min-[1001px]:`. Define the export's breakpoints as `--breakpoint-*` tokens so they are named,
  not magic numbers (see conventions). The styles *outside* any media query are the desktop design.
- `@media (prefers-reduced-motion:reduce)` → keep it, as a `motion-reduce:` variant or a base-layer rule.
  Note the export's rule is usually `*{animation:none}`, which does **not** reach `::before/::after`.
  So in reduced-motion captures the original may still show pseudo-element animation mid-frame.
  Don't copy that gap: cover pseudo-elements too, and hide purely decorative looping effects
  (pulse rings) under reduced motion rather than freezing them in an odd frame.

## Runtime console noise

Opening the original in a browser logs errors like
`<path> attribute d: Expected moveto… "{{ l.icon }}"`. That is the runtime parsing
the template before binding. It is harmless and irrelevant to the conversion. Only errors on the
**converted** side matter.
