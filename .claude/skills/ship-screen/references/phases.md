# Phases

Every phase: goal, who runs it, what to read, what to run, what "done" means. Paths
are relative to the project root. `$Q` = `.quality/<screen>`, `$S` =
`.claude/skills/ship-screen/scripts`.

## Contents
0 preflight · 1 convert · 2 build · 3 forms · 4 tests · 5 structure · 6 a11y · 7 seo ·
8 security · 9 errors · 10 perf · 11 review · 12 final · 13 report

The order follows one rule: build everything, then cast the test net, then refactor and
polish, then harden, then measure, then review.
- Forms comes before tests because it rewrites form behaviour. On the homepage trial, tests
  were written for a stub form that the later forms phase replaced (4 → 12 tests), and the
  form code never got a structure or a11y pass.
- Perf comes after security and errors, so it measures the page with its final headers,
  error boundaries and form code. On the trial, a security header added after the perf
  phase cost mobile perf ~26 points and wasn't noticed until final.

## The regression check

After every agent phase the orchestrator runs a quick check against a **baseline**, the
best value each metric has reached so far in this run (`$Q/baseline.json`, see
`$S/baseline.mjs`):

```
node $S/audit.mjs --quick --routes <route> --original screens/<screen>/Main.dc.html \
  --baseline $Q/baseline.json --phase <id> --out $Q/NN-check
```

`--quick` runs these checks on the build the gates just made:
- console errors and full-page axe
- a focus walk: every Tab stop at 1440, 390 and 844×390 landscape
- a responsive sweep: overflow at 320–1920 and landscape, text spacing, and how much of a
  landscape phone screen the fixed bars cover
- first-load JS weight against the JS budget
- iPhone Safari's engine (WebKit): errors, sideways scroll, and layout compared with Chromium
- security headers
- design capture at 1440/390, each width against its nearest design board (390 against the
  mobile board when there is one): layout, **design copy missing from the page**, and every
  state board listed in `tests/design-states/<screen>.json`
- mobile Lighthouse

It takes about 3 minutes, a bit more when Lighthouse re-measures. These are the things
that can get worse without a unit or E2E test failing. A metric regresses when it gets
worse than its baseline by more than the noise allowance:

| metric | allowed to get worse by |
|---|---|
| console errors, axe serious/critical, axe rules violated, broken links | 0 |
| focus: stops hidden while focused, stops without outline/ring, focus trap | 0 |
| sweep: widths that scroll sideways or cut content off, text-spacing issues | 0 |
| sweep: share of a landscape phone screen covered by fixed bars | 5 points |
| design copy missing from the page, per width | 0 |
| state board: couldn't be reproduced, landmark count | 0 |
| state board: height drift / pixel diff | 1.5 points |
| first-load JS | 15 KB gzip (more needs a `TRADE-OFF:`) |
| Safari: errors, sideways scroll, landmark count | 0 |
| Safari: landmark heights vs Chromium | 1.5 points |
| a security header that was present | 0 (must stay) |
| capture height drift / pixel diff, per width | 1.5 points |
| capture landmark count, overflow, page errors | 0 |
| Lighthouse perf score | 8 points (a run that looks regressed is re-measured once; the better comparable run counts) |
| Lighthouse SEO score | 0 |
| LCP / TBT / CLS | 500ms / 250ms / 0.05 |

**Machine speed.** Lighthouse numbers follow the laptop's speed at that moment (thermal
throttling, power mode, background work). Lighthouse reports that speed as a CPU benchmark
index, and on this laptop it has ranged ~930-2060; mobile perf once moved 16 points on
identical code. So each Lighthouse value is stored with the CPU benchmark of its run, and
a worse value only counts when the two runs are within 15% of each other's speed. Outside
that it's reported as *not comparable* (a warning, never a regression) and the Lighthouse
baseline is re-based on the new run so later phases can be compared again. The perf phase
and final still measure properly, so a slowdown can't slip through to the end.

Exit 0: no regressions, and each metric's baseline moves to its new best. Exit 1: the
regressions are listed (`before → now`, and which phase set the old value) and the baseline
is left as it was. Agents can run the same command **without `--phase`** to compare
without recording anything.

### Other screens (shared code)

Once more than one screen is converted, a phase can break *another* screen through shared
code: layout, `components/ui`, `globals.css`, `next.config.ts`, `package.json`. The gates
run every screen's unit and E2E tests, but not their capture, axe, focus or sweep. So:

- `node $S/screens.mjs others <screen>` prints the `--routes … --original …` arguments for
  every other converted screen (nothing when this is the only one). Call its output `<others>`.
- Pre-flight records the other screens' starting point in `$Q/baseline-others.json`.
- After a phase, if `node $S/screens.mjs shared-changes <screen>` prints any file, also run
  `node $S/audit.mjs --quick --checks console,axe,focus,sweep,headers,capture <others> --baseline $Q/baseline-others.json --phase <id> --out $Q/NN-others`.
  Lighthouse is left out because it's the slow part; final measures it. A regression here
  is handled exactly like one on this screen: same agent, same `SendMessage`.
- Final runs it once more with Lighthouse.

---

## 0 · Pre-flight (orchestrator)

1. **Screen + route.** `screens/<screen>/` must hold a board, usually `Main.dc.html` (unless `--no-convert`).
   Route: `homepage` → `/`, else `/<screen>` in kebab-case. If the folder name doesn't
   obviously map to a URL, ask the user. A folder named `<screen>-mobile` (or `-tablet`,
   `-phone`, `-desktop`) is a board of `<screen>`, not a screen: run the pipeline for `<screen>`.
2. **Boards.** `node .claude/skills/screen-to-nextjs/scripts/boards.mjs screens/<screen>`.
   Put the board list (e.g. `desktop Main.dc.html 1440 · phone mobile/Main.dc.html 390`) in
   this phase's note and in every agent prompt. If the export has no `Main.dc.html` (boards
   named `Desktop.dc.html`, `Mobile.dc.html`), pass the folder `screens/<screen>` wherever
   a command says `screens/<screen>/Main.dc.html`; the scripts accept either.
   - **No phone board**, convert will run, and the run wasn't started with `--desktop-only`:
     the design team now draws mobile boards, so ask the user whether one is coming before
     converting. Converting without it means a re-sync later. Continue desktop-only only
     when they say so, and record that in this phase's note.
   - **Re-sync:** if `src/features/<screen>` already exists and a board was added since
     (the mobile board arriving after the desktop screen shipped), run without
     `--no-convert`. The convert phase re-syncs the phone band ("Re-syncing an updated
     export" in screen-to-nextjs).
3. **Clean tree.** `git status --porcelain` must be empty. If not, stop and ask the user
   to commit or stash. Don't do it for them.
4. **Branch.** On `main`/`master`/`dev` → `git switch -c feat/<screen>` (or
   `feat/<screen>-quality` with `--no-convert`, `feat/<screen>-resync` for a re-sync; if the
   name is taken, append `-2`). Already on a feature branch → stay.
   Record the base commit (`git rev-parse HEAD`) for the review diff.
   If `git branch --no-merged <base>` lists an earlier screen's `feat/*` branch, ask whether
   to merge it first. Until it's merged, that screen and its shared changes (tokens,
   primitives, header/footer, headers) are missing from this run, and the two branches will
   conflict later.
5. **Tooling.** If any of `vitest`, `@testing-library/react`, `@playwright/test`,
   `axe-core` is missing from devDependencies, or `vitest.config.mts` /
   `playwright.config.ts` (with the `iphone` and `firefox` projects) / `tests/setup.ts` / `tests/axe.ts` /
   `tests/e2e/fixtures.ts` is missing, apply `references/tooling-setup.md`, run
   `$S/gates.mjs --no-build`, and commit `chore: add test and audit tooling`. Make sure
   WebKit and Firefox are installed (`npx playwright install webkit firefox`). Without them, those checks are
   skipped, so tell the user if it can't be downloaded.
6. **Ignore output.** Ensure `.gitignore` has `/.quality/`, `/test-results/`, `/playwright-report/`.
7. **State.** `node $S/state.mjs init <screen> --route <route> --base <sha> --branch <branch> --flags "<flags>"`.
8. **Other screens' baseline.** If `node $S/screens.mjs others <screen>` prints anything:
   `node $S/gates.mjs --out $Q/00-gates.md`, then
   `node $S/audit.mjs --quick <others> --baseline $Q/baseline-others.json --phase preflight --reset-baseline --out $Q/00-others`.
   This is the base commit, before this run changes anything. The audit's exit code doesn't
   matter. If the base doesn't build, tell the user: the run can't start from a red tree.
   A `--from` resume keeps the existing file.

Blocking: any failure stops the pipeline.

## 1 · Convert (`screen-converter` agent)

Runs the `screen-to-nextjs` skill end to end (inventory → plan → foundation → sections →
compose → verify), including its capture loop against the design at 1440/1000/390, each
width against its nearest board (390 against the mobile board when there is one). If
`src/features/<screen>` already exists, the converter re-syncs instead of starting over.
Output: the converter's summary (plan table, files, capture table, judgment calls).
Blocking: the capture must be within tolerance (or deviations explained) and gates green;
otherwise stop and show the user. Within tolerance also means:
- **Copy:** no design copy missing at any width. A line that's deliberately different is
  listed as a deviation.
- **State boards:** every state board has an entry in `tests/design-states/<screen>.json`
  that reproduces it on the page.
- **Safari:** the `webkit` check shows nothing that Chromium doesn't: no extra errors, no
  sideways scroll, and landmark heights within 4%.

Skipped with `--no-convert` (screen already converted).

## 2 · Build gate (orchestrator)

`node $S/gates.mjs --out $Q/02-gates.md` (without `--tests`: tests don't exist yet on a
first run). Blocking. If it fails right after conversion, resume the converter once with
the gate output. Still red → stop.

Then start this run's baseline: the regression-check command with `--links --phase build
--reset-baseline --out $Q/02-check`. Its exit code doesn't matter here: whatever the
screen scores now is the starting point. (Every run that passes through the build gate,
including `--only`, starts a fresh baseline; a `--from` resume keeps the existing one.)

`--links` adds the link check to this one run, so broken links (pages that don't exist
yet, `#` placeholders) are known before any agent starts. Put each one into "Open
decisions so far" for every agent prompt. On the trial, five phases raised the same four
unbuilt routes, and their prefetch 404s made the E2E suite flaky before anyone knew.

## 3 · Forms (`form-auditor`, conditional)

Runs only when `scan.mjs` finds form controls on the screen.
Skills: `form-handling-validation`, `security-practices` (rules 13, 24).

- React Hook Form + Zod: one schema drives client validation **and** server re-validation
  (Server Action). `mode: "onTouched"`, correct `autoComplete`, labels, `aria-invalid` +
  `aria-describedby`, focus the first error, disabled + pending state, no double submit.
- Anonymous public forms: honeypot field + server-side check; note rate limiting as a
  deployment decision.
- **No invented backend.** Deliver to a configurable endpoint (e.g. `LEADS_WEBHOOK_URL`);
  when it's unset, fail loudly in production and log in development. List it under
  `DECISIONS NEEDED`.
- Children's personal data (DPDP): collect the minimum, and put a consent checkbox linked to the privacy policy on forms collecting a child's data.
- **Works before hydration.** A tap before React hydrates is lost in Safari, where WebKit
  doesn't replay it. On a slow phone that means "I pressed Subscribe and nothing happened".
  Give the form a Server Action as its `action` (with `useActionState` for the result), so
  it submits and validates on the server even before hydration. Client-side RHF
  validation then layers on top. If that isn't possible, list it as a decision.
- **iPhone inputs:** text inputs, selects and textareas need a font size of at least 16px on
  phones. Below that, iOS Safari zooms the page when the field gets focus.
- Tests for valid, invalid and pending states. This phase runs before the tests phase, so on
  the first screen there may be no test suite yet: write the form's own unit tests
  (`gates.mjs --tests` skips a test gate that has no test files, it doesn't fail it). The
  tests phase adds the E2E spec.

## 4 · Tests (`test-engineer`)

Skills: `testing-frontend`. Setup facts: `references/tooling-setup.md`.

- **Component tests** (`Name.test.tsx`, co-located) for every client component on the
  screen (`scan.mjs` lists `"use client"` files): every state transition the component
  owns (tabs, accordion, game, picker, form states), keyboard operation with
  `userEvent`, ARIA state (`aria-expanded`, `aria-selected`, `aria-pressed`), and
  `expect(await axeViolations(container)).toEqual([])`. A form the forms phase already
  covered: extend its tests only where something is missing, don't duplicate them.
- **Pure logic** (structured-data builders, helpers): unit tests, e.g. the FAQ JSON-LD
  has one Question per `content.ts` item.
- **E2E** `tests/e2e/<screen>.spec.ts`, desktop + mobile + **iphone** (WebKit) + **firefox** projects,
  importing `test`/`expect` from `./fixtures`: renders with an `h1`, zero console/page
  errors, no horizontal overflow, each interactive widget works once in a real browser,
  primary CTA has a real `href`.
  - A test that fails only in `iphone` is a Safari bug to fix (conventions "Safari (iPhone)"),
    not a test to skip.
  - The one exception is Tab-order tests: Safari leaves links out of the Tab order by
    default, so skip those for WebKit with that reason (tooling-setup.md, fixtures). Links to pages that don't exist yet
  (the open decision from the build gate) prefetch as 404s: list them in the spec's
  known-unbuilt set instead of letting them flake.
- Query by role/label/text (content from `content.ts`, never duplicated literals).
  `data-testid` only as a last resort. No snapshot tests.
- Random or animated things (canvas, auto-advance timers): use fake timers or assert
  structure, never pixels. Flaky test = fix or delete, never retry-until-green.
- **Mobile/desktop variants**: jsdom applies no CSS, so both copies of a responsive variant
  (inline nav and drawer) are in the DOM in component tests. Scope queries with `within()`
  to one variant. Test what only one width shows (the hamburger drawer, a mobile-only
  carousel) in the E2E project for that width: the drawer opens, closes on Escape, and its
  links work.

Done: `gates.mjs --tests` green, every client component covered.

## 5 · Structure, tokens, types (`architecture-auditor`)

Skills: `component-architecture`, `design-tokens`, `typescript-patterns`, plus
`screen-to-nextjs/references/conventions.md`.

Run `node $S/scan.mjs --paths src --out $Q/05-scan.md` and fix:
- Files over ~200 lines that aren't pure data → split at natural seams.
- `"use client"` on anything that isn't an interactive leaf → push the boundary down.
- Raw hex in TSX: a colour used in 2+ places becomes an `@theme` token named by role, and
  per-item colours go through tones. One-off decorative values may stay arbitrary.
- `any`, suppressions, cross-feature imports, `components/` → `features/` imports, raw
  `<img>`, `console.log`, hard-coded UI text (move to `content.ts`).
- Props typed; discriminated unions for mutually exclusive states.
- Mobile/desktop variants (conventions §4 "With a mobile board"): one DOM with responsive
  classes, and a second copy only where the structure differs. Both copies render from
  `content.ts`, the unused one is `display:none`, and images that differ use
  `getImageProps` + `<picture>`.
- Shared code (`components/ui`, `globals.css`, layout) is used by every converted screen:
  a change there triggers the other-screens check, so keep it deliberate.

**Pure refactor**: no visual or behavioural change. Tests must stay green without edits.
Prove there's no visual drift: `node $S/gates.mjs` then
`node $S/audit.mjs --routes <route> --checks capture --original screens/<screen>/Main.dc.html --widths 1440,390 --out $Q/05-audit`,
and compare the per-section numbers with the converter's capture.

## 6 · Accessibility (`a11y-auditor`)

Skills: `accessibility`, `animation-motion`.

- `node $S/audit.mjs --routes <route> --checks axe,console,focus,sweep --out $Q/06-audit`
  and fix every violation. Serious/critical first.
- **Focus walk**: the `focus` check Tabs through the page at 1440, 390 and 844×390 landscape
  and writes a contact sheet for each (`$Q/06-audit/focus-<route>-<width>.png`), one crop per stop.
  - Look at every stop on the sheet. An indicator can exist and still look broken (clipped,
    no padding, too faint), and only the image shows that. On the trial, a skip link lost
    its padding when focused, and only the reviewer caught it.
  - Fix every stop that's **hidden while focused**. "Off-screen" usually means a closed
    drawer or hidden variant that's still focusable. "Covered by …" usually means the sticky
    header: fix it with `scroll-padding-top` (WCAG 2.4.11).
  - Fix every **focus trap**.
  - A stop "without outline/ring" is fine if the sheet shows another clear indicator.
- Then walk the widgets by hand with Playwright: logical order, each widget operable with
  Enter/Space/arrows, skip link or first focus lands sensibly. Hover-only interactions
  must also work on focus/click.
- **Reflow and spacing** (the `sweep` check):
  - No sideways scroll at 320px (WCAG 1.4.10). The 600/768 widths also stand in for 200%
    zoom on a 1280px window.
  - No text cut off under the WCAG 1.4.12 text-spacing overrides.
  - Widths between the design boards have no design to match, so fix them from the nearest
    board's layout.
  - Landscape phone (844×390): no sideways scroll, and fixed/sticky bars leave most of the
    short screen for content. Over 40% covered is a warning. Shrink or un-stick them under
    `@media (max-height: 500px)`.
- Headings: one `h1`, no skipped levels. Landmarks: `header`, `nav`, `main`, `footer`.
- Images: `alt` from the export, decorative `alt=""`. Canvases/decorative SVG `aria-hidden`.
- Motion: `prefers-reduced-motion` respected, including `::before/::after`; auto-advancing
  content pauses on hover/focus.
- Phone width (390): a nav drawer's toggle has `aria-expanded` + `aria-controls`. Opening
  moves focus into the drawer, Escape and close return it to the toggle, and the page behind
  isn't reachable by Tab while it's open. Walk the keyboard at 390 with the drawer open too.
  Targets are ≥24×24px (WCAG 2.5.8). A smaller target drawn on the mobile board goes under
  `DECISIONS NEEDED`. Content hidden at a width is `display:none` there, not off-screen or
  transparent.
- **Contrast failures from design colours**: compute the nearest AA-compliant shade
  (same hue, ≥4.5:1, or ≥3:1 for large text) and put it under `DECISIONS NEEDED`. Apply
  it only if the run was started with `--fix-contrast`.

Done: 0 serious/critical axe violations (other than design-colour decisions), no focus
hidden or trapped, every stop on the contact sheets visibly focused, no sideways scroll at
320, keyboard walkthrough clean.

## 7 · SEO / GEO / AEO (`seo-auditor`)

Skills: `seo-metadata`.

- Route `metadata`: unique title (≤60 chars ideal) + description (≤160), canonical,
  Open Graph + Twitter (site-level `opengraph-image` applies unless the route needs its own).
- Structured data built **from `content.ts`** (`src/features/<screen>/structured-data.ts`,
  rendered with `components/seo/JsonLd`): the types that genuinely fit the screen
  (`FAQPage` for FAQs, `Service`/`Course`/`Offer` for programmes, `BreadcrumbList` below
  the homepage, `Organization`/`WebSite` only once site-wide). Every value must be visible
  on the page, so write a test that asserts it.
- `src/app/sitemap.ts` lists the route. `robots.ts` allows it. `/llms.txt`
  (`src/app/llms.txt/route.ts`) gains a section for the screen's key facts and links.
- On-page: one `h1`, descriptive link text, meaningful `alt`, internal links resolve
  (`audit.mjs --checks links`). Links already under open decisions from the build gate
  stay there; only add new ones.
- Lighthouse SEO ≥95 (`canonical` failing on localhost is expected: it points at the production domain).

## 8 · Security (`security-auditor`)

Skills: `security-practices`. Next docs: `02-guides/content-security-policy.md`.

- Headers via `next.config.ts` `headers()`: `Content-Security-Policy`,
  `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`,
  `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy`
  (camera/microphone/geolocation off unless used), `X-Frame-Options: DENY` or
  `frame-ancestors 'none'`, and `poweredByHeader: false`.
- **CSP on static pages**: nonces force dynamic rendering, so don't switch a static
  route to dynamic without asking. Use the no-nonce policy from the Next guide
  (`script-src 'self' 'unsafe-inline'`, `style-src 'self' 'unsafe-inline'`,
  `img-src 'self' blob: data:`, `font-src 'self'`, `object-src 'none'`, `base-uri 'self'`,
  `form-action 'self'`, `frame-ancestors 'none'`, `upgrade-insecure-requests`), adding
  only origins the site actually uses (`'unsafe-eval'` in development only).
- After CSP: `audit.mjs --checks headers,console` (CSP violations show up as console errors),
  and check `/opengraph-image`, `/icon` and `/llms.txt` still return 200.
- Code: `dangerouslySetInnerHTML` only for escaped JSON-LD; `target="_blank"` has
  `rel="noopener noreferrer"`; no secrets in client code (`NEXT_PUBLIC_` only for public
  values); third-party scripts vetted.
- `npm audit --omit=dev`: fix high/critical by updating. Report what's left.
- Headers apply to every route, so this phase always triggers the other-screens check.

## 9 · Error handling (`error-handling-auditor`)

Skills: `error-observability`. Next docs: `03-api-reference/03-file-conventions/error.md`,
`not-found.md`.

- `src/app/error.tsx` (client; Next 16 passes `retry()`, prefer it over `reset()`),
  `src/app/global-error.tsx` (own `<html>`/`<body>`, minimal inline styling since global
  CSS doesn't load), branded `src/app/not-found.tsx`. Each uses the site's primitives
  and links home and to the primary CTA. Copy goes in a content file.
- Client widgets that touch browser APIs (canvas, observers, timers) fail soft: a broken
  animation must not blank the section.
- Zero console errors on the route (`audit.mjs --checks console`).
- No error-monitoring vendor (Sentry etc.) without a decision → `DECISIONS NEEDED`.

## 10 · Performance (`perf-auditor`)

Skills: `performance-optimization`.

Runs this late so it measures the page as it will ship: every header, error boundary,
form and font is already in place.

- `node $S/gates.mjs` (fresh build), then
  `node $S/audit.mjs --routes <route> --checks lighthouse,weight --out $Q/10-audit`.
  Budgets (override with `--budget`): desktop perf ≥90, LCP ≤2.5s; mobile perf ≥80,
  LCP ≤4s; CLS ≤0.1; TBT ≤200ms desktop / 300ms mobile; **first-load JS ≤250 KB gzip, target
  ≤200** (`weight.js`).
- **JS budget**: follow `performance-optimization` rules, Rule 2 "The JS budget in this
  project", and its definition of done (section 2). Growth over 15 KB in any phase has
  to be explained. Diagnose with `npx next experimental-analyze --output`, before vs after.
- Known wins on this stack:
  - LCP image: `loading="eager"` + `fetchPriority="high"`, not `preload` (Next 16's
    `preload` link has no fetchpriority and competes with other preloads).
  - LCP text must not start at `opacity: 0`. Chrome ignores invisible paints, so a fade-in
    hero pushes LCP onto another element. Use a transform-only entrance (`animate-rise`).
  - Only one image may be eager/high above the fold. Logos stay small.
  - Art-directed hero (the mobile board has its own image): `getImageProps` + `<picture>`
    with `fetchPriority="high"` on the `<img>`. Check that the mobile Lighthouse LCP element
    is the mobile board's hero and that each viewport requests only one hero image.
  - `sizes` on every `next/image`; `next/font` with only the weights used, and
    `preload: false` for secondary display/handwriting fonts.
  - Heavy client widgets below the fold (canvas animations): start work on idle or on
    visibility; `next/dynamic` for large client-only components.
  - Oversized PNG/JPG sources: let `next/image` serve AVIF/WebP (`images.formats`).
  - A security header or CSP rule that costs performance is a trade-off, not a perf fix:
    don't remove it, put both numbers under `DECISIONS NEEDED`.
- Localhost Lighthouse varies ±5. Re-run once before chasing a small miss; report the
  median of what you ran.
- The orchestrator's regression check after this phase adds `--modes mobile,desktop`, so
  desktop numbers join the baseline too.

Done: Lighthouse and JS budgets met, or `partial` with the measured numbers and what would
move them.

## 11 · Code review (`code-reviewer`, read-only)

Skills: `code-review-checklist` (+ the security/a11y/perf cross-checks it names).
Diff: `git diff <base>...HEAD` from the run state. Reviews the whole pipeline's output
with fresh eyes. When the screen has a mobile board, also look for duplicated section DOM,
a hidden variant that's still focusable, and copy that exists in one variant but not in
`content.ts`. It reports; the orchestrator applies `must-fix` items, re-runs gates, runs
the regression check with `--phase review` (and the other-screens check if the fixes touch
shared code), and commits `fix(<screen>): address review`. One re-review of the fix diff
at most.

## 12 · Final regression (orchestrator)

1. `node $S/gates.mjs --tests --out $Q/12-gates.md` (fresh production build + all tests)
2. `node $S/audit.mjs --routes <route> --original screens/<screen>/Main.dc.html --baseline $Q/baseline.json --phase final --out $Q/12-audit`:
   every check, including links, focus, sweep, desktop Lighthouse and the design capture
   at 1440/1000/390 on the production build, each width against its nearest board. Drop
   `--original` if the export no longer exists.
3. Other screens, if any: `node $S/audit.mjs --quick <others> --baseline $Q/baseline-others.json --phase final --out $Q/12-others`
   (with Lighthouse this time), compared with where they started in pre-flight.

Every phase was already checked against the baseline, so this is a confirmation, not a
search. A regression here comes from the review fixes or from something the quick check
doesn't cover (links, the 1000px capture, other screens' Lighthouse). Hand it back **once**
to the agent that owns that area, then re-run this phase:
- perf: Lighthouse and first-load JS
- a11y: axe, focus and sweep
- security: headers
- structure or the converter: capture, missing copy, state boards and Safari layout
- seo: links
- errors: Safari-only console errors For another screen's regression, `baseline-others.json`'s history shows which phases
changed shared code. Still failing → report it. Blocking only for red gates.

## 13 · Report (orchestrator)

`node $S/state.mjs report <screen>` → `$Q/REPORT.md` (phase table plus the per-phase
regression-check trend from the baseline).

**Design review pack.** Write the merged, de-duplicated decisions and every deliberate
deviation from a board to `$Q/DECISIONS.md` (markdown bullets under `##` headings), then run
`node $S/review-pack.mjs <screen>`. It writes `$Q/DESIGN-REVIEW.html`, a single file for the
design team with:
- items that differ noticeably first
- every board next to the built page, section by section, at each width
- the state boards and any design copy that's missing
- the decisions, each with a sign-off box

It uses the newest capture, which is the final audit's.

Then tell the user:
per-phase table, the headline numbers (tests, axe, focus, sweep, Lighthouse, headers,
capture, other screens), any trade-off accepted into the baseline, every
`DECISIONS NEEDED` item merged and de-duplicated, commits on the branch, and next steps
(review the branch, merge, push). Never push or merge yourself.
