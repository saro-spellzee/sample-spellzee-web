# Definition of Done: converted screen

A screen is done when every box below is checked, or explicitly listed in the
summary as not done with the reason. Each group names the project skill that owns
the standard; open that skill's `references/definition-of-done.md` only for the groups
where you have doubts, not all of them by default.

## 1. Builds clean
- [ ] `npx tsc --noEmit` passes, no `any`, no `@ts-ignore` (`typescript-patterns`)
- [ ] `npm run lint` passes with no new warnings
- [ ] `npm run build` succeeds, and the route is statically rendered (○ in the build output) unless it genuinely needs to be dynamic
- [ ] No console errors or hydration warnings on the converted page (capture report: converted errors = 0)

## 2. Visual fidelity (`figma-pixel-perfect`)
- [ ] Capture report at 1440 / 1000 / 390, each width against its nearest design board (`boards.mjs`): same landmark count, every landmark within ~4% height of the original, 0px horizontal overflow
- [ ] Every pair image inspected. Colours, type size/weight/line-height, spacing, radii, shadows, gradients and image crops match
- [ ] Fonts are the export's fonts (no fallback rendering); weights match
- [ ] Remaining differences are listed in the summary with the reason (e.g. canvas animation frame differs, which is expected)

## 3. Responsive (`figma-pixel-perfect`, section "breakpoints")
- [ ] Phone (390): nothing clipped, overlapping or scrolling horizontally; tap targets ≥ 44px; text ≥ 12px
- [ ] With a mobile board: 390 matches it, every difference is listed with its reason, and each state board (menu open, …) is reproduced and checked at its width
- [ ] Tablet (1000) follows the tablet board if there is one, else the export's `max-width:1000px` rules
- [ ] Mobile and desktop share one DOM per landmark. A second variant exists only where the structure differs, it renders from the same `content.ts`, and the unused one is `display:none`
- [ ] An image that differs on the mobile board uses art direction (`getImageProps` + `<picture>`), so each viewport downloads only its own image
- [ ] Breakpoints come from `@theme` tokens, not scattered arbitrary `min-[…]` values

## 4. Structure (`component-architecture`)
- [ ] One component per landmark under `src/features/<screen>/sections/`, composed in `page.tsx` in the export's order
- [ ] No file over ~200 lines; repeated markup is a mapped component, not copy-paste
- [ ] `"use client"` only on interactive leaves; sections stay Server Components
- [ ] Primitives reused from `components/ui` (or created there), with no cross-feature imports
- [ ] All copy in `content.ts`, verbatim, and no user-visible strings in JSX

## 5. Styling (`design-tokens`)
- [ ] Recurring colours/radii/shadows/type sizes are `@theme` tokens named by role
- [ ] Per-item colours go through tones, with no string-built class names
- [ ] No leftover inline `style` except continuous values (percentages, CSS variables)
- [ ] Placeholder create-next-app styles (Geist, dark-mode swap) removed

## 6. Interactivity and motion (`animation-motion`, `state-management`)
- [ ] Every `setState` behaviour in the logic class works: cycles, toggles, resets, auto-advance
- [ ] Hover / focus-visible / active states from the stylesheet are present on every interactive element
- [ ] Every `@keyframes` animation is ported and fires where the original fires it
- [ ] Canvas/timer effects clean up on unmount, pause off-screen, and stop under reduced motion
- [ ] `prefers-reduced-motion` respected site-wide

## 7. Accessibility (`accessibility`)
- [ ] Heading levels as in the export (one `h1`), landmarks (`header`, `nav`, `main`, `footer`) present
- [ ] Accordions: `<button aria-expanded aria-controls>` + panel `id`; tabs: `role="tablist"/"tab"/"tabpanel"`, `aria-selected`, arrow-key navigation
- [ ] Hover-only interactions (e.g. `onMouseEnter` pickers) also work by click and keyboard focus
- [ ] Every interactive element is reachable by Tab with a visible focus ring
- [ ] `alt` text verbatim from the export; decorative images/canvases `alt=""`/`aria-hidden`
- [ ] Text contrast ≥ 4.5:1 (3:1 for large text). Flag any design colour that fails rather than silently changing it

## 8. Performance (`performance-optimization`)
- [ ] LCP image uses `next/image` with `loading="eager"` + `fetchPriority="high"`; others lazy with correct `sizes`
- [ ] Hero text doesn't start at `opacity: 0` (it would drop out of LCP)
- [ ] Fonts via `next/font`, only the weights used
- [ ] No layout shift from images or fonts (dimensions known, font `display` handled by next/font)
- [ ] Client JS limited to interactive leaves; heavy canvas code only in the components that use it

## 9. SEO (`seo-metadata`)
- [ ] `metadata` exported with title (from the export) + description + Open Graph
- [ ] `<html lang="en">`; in-page anchor links resolve to section ids

## 10. Forms (only if the screen has one; `form-handling-validation`)
- [ ] Labelled inputs, native validation at minimum, a disabled/pending state on submit
- [ ] No invented backend. The submit target is a clear `TODO` listed in the summary
