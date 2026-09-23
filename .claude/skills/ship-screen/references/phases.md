# Phases

Every phase: goal, who runs it, what to read, what to run, what "done" means. Paths
are relative to the project root. `$Q` = `.quality/<screen>`, `$S` =
`.claude/skills/ship-screen/scripts`.

## Contents
0 preflight · 1 convert · 2 build · 3 tests · 4 structure · 5 a11y · 6 perf · 7 seo ·
8 forms · 9 security · 10 errors · 11 review · 12 final · 13 report

---

## 0 · Pre-flight (orchestrator)

1. **Screen + route.** `screens/<screen>/Main.dc.html` must exist (unless `--no-convert`).
   Route: `homepage` → `/`, else `/<screen>` in kebab-case. If the folder name doesn't
   obviously map to a URL, ask the user.
2. **Clean tree.** `git status --porcelain` must be empty. If not, stop and ask the user
   to commit or stash. Don't do it for them.
3. **Branch.** On `main`/`master`/`dev` → `git switch -c feat/<screen>` (or
   `feat/<screen>-quality` with `--no-convert`). Already on a feature branch → stay.
   Record the base commit (`git rev-parse HEAD`) for the review diff.
4. **Tooling.** If any of `vitest`, `@testing-library/react`, `@playwright/test`,
   `axe-core` is missing from devDependencies, or `vitest.config.mts` /
   `playwright.config.ts` / `tests/setup.ts` / `tests/axe.ts` is missing, apply
   `references/tooling-setup.md`, run `$S/gates.mjs --no-build`, and commit
   `chore: add test and audit tooling`.
5. **Ignore output.** Ensure `.gitignore` has `/.quality/`, `/test-results/`, `/playwright-report/`.
6. **State.** `node $S/state.mjs init <screen> --route <route> --base <sha> --branch <branch> --flags "<flags>"`.

Blocking: any failure stops the pipeline.

## 1 · Convert (`screen-converter` agent)

Runs the `screen-to-nextjs` skill end to end (inventory → plan → foundation → sections →
compose → verify), including its capture loop against the design at 1440/1000/390.
Output: the converter's summary (plan table, files, capture table, judgment calls).
Blocking: the capture must be within tolerance (or deviations explained) and gates green;
otherwise stop and show the user.

Skipped with `--no-convert` (screen already converted).

## 2 · Build gate (orchestrator)

`node $S/gates.mjs --out $Q/02-gates.md` (without `--tests`: tests don't exist yet on a
first run). Blocking. If it fails right after conversion, resume the converter once with
the gate output. Still red → stop.

## 3 · Tests (`test-engineer`)

Skills: `testing-frontend`. Setup facts: `references/tooling-setup.md`.

- **Component tests** (`Name.test.tsx`, co-located) for every client component on the
  screen (`scan.mjs` lists `"use client"` files): every state transition the component
  owns (tabs, accordion, game, picker, form states), keyboard operation with
  `userEvent`, ARIA state (`aria-expanded`, `aria-selected`, `aria-pressed`), and
  `expect(await axeViolations(container)).toEqual([])`.
- **Pure logic** (structured-data builders, helpers): unit tests, e.g. the FAQ JSON-LD
  has one Question per `content.ts` item.
- **E2E** `tests/e2e/<screen>.spec.ts`, desktop + mobile projects: renders with an `h1`,
  zero console/page errors, no horizontal overflow, each interactive widget works once
  in a real browser, primary CTA has a real `href`.
- Query by role/label/text (content from `content.ts`, never duplicated literals).
  `data-testid` only as a last resort. No snapshot tests.
- Random or animated things (canvas, auto-advance timers): use fake timers or assert
  structure, never pixels. Flaky test = fix or delete, never retry-until-green.

Done: `gates.mjs --tests` green, every client component covered.

## 4 · Structure, tokens, types (`architecture-auditor`)

Skills: `component-architecture`, `design-tokens`, `typescript-patterns`, plus
`screen-to-nextjs/references/conventions.md`.

Run `node $S/scan.mjs --paths src --out $Q/04-scan.md` and fix:
- Files over ~200 lines that aren't pure data → split at natural seams.
- `"use client"` on anything that isn't an interactive leaf → push the boundary down.
- Raw hex in TSX: a colour used in 2+ places becomes an `@theme` token named by role, and
  per-item colours go through tones. One-off decorative values may stay arbitrary.
- `any`, suppressions, cross-feature imports, `components/` → `features/` imports, raw
  `<img>`, `console.log`, hard-coded UI text (move to `content.ts`).
- Props typed; discriminated unions for mutually exclusive states.

**Pure refactor**: no visual or behavioural change. Tests must stay green without edits.
Prove there's no visual drift: `node $S/gates.mjs` then
`node $S/audit.mjs --routes <route> --checks capture --original screens/<screen>/Main.dc.html --widths 1440,390 --out $Q/04-audit`,
and compare the per-section numbers with the converter's capture.

## 5 · Accessibility (`a11y-auditor`)

Skills: `accessibility`, `animation-motion`.

- `node $S/audit.mjs --routes <route> --checks axe,console --out $Q/05-audit` and fix every
  violation. Serious/critical first.
- Keyboard: tab through the page with Playwright (focus visible on every interactive
  element, logical order, no traps, skip link or first focus lands sensibly).
  Hover-only interactions must also work on focus/click.
- Headings: one `h1`, no skipped levels. Landmarks: `header`, `nav`, `main`, `footer`.
- Images: `alt` from the export, decorative `alt=""`. Canvases/decorative SVG `aria-hidden`.
- Motion: `prefers-reduced-motion` respected, including `::before/::after`; auto-advancing
  content pauses on hover/focus.
- **Contrast failures from design colours**: compute the nearest AA-compliant shade
  (same hue, ≥4.5:1, or ≥3:1 for large text) and put it under `DECISIONS NEEDED`. Apply
  it only if the run was started with `--fix-contrast`.

Done: 0 serious/critical axe violations (other than design-colour decisions), keyboard
walkthrough clean.

## 6 · Performance (`perf-auditor`)

Skills: `performance-optimization`.

- `node $S/gates.mjs` (fresh build), then
  `node $S/audit.mjs --routes <route> --checks lighthouse --out $Q/06-audit`.
  Budgets (override with `--budget`): desktop perf ≥90, LCP ≤2.5s; mobile perf ≥80,
  LCP ≤4s; CLS ≤0.1; TBT ≤200ms desktop / 300ms mobile.
- Known wins on this stack:
  - LCP image: `loading="eager"` + `fetchPriority="high"`, not `preload` (Next 16's
    `preload` link has no fetchpriority and competes with other preloads).
  - LCP text must not start at `opacity: 0`. Chrome ignores invisible paints, so a fade-in
    hero pushes LCP onto another element. Use a transform-only entrance (`animate-rise`).
  - Only one image may be eager/high above the fold. Logos stay small.
  - `sizes` on every `next/image`; `next/font` with only the weights used, and
    `preload: false` for secondary display/handwriting fonts.
  - Heavy client widgets below the fold (canvas animations): start work on idle or on
    visibility; `next/dynamic` for large client-only components.
  - Oversized PNG/JPG sources: let `next/image` serve AVIF/WebP (`images.formats`).
- Localhost Lighthouse varies ±5. Re-run once before chasing a small miss; report the
  median of what you ran.

Done: budgets met, or `partial` with the measured numbers and what would move them.

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
  (`audit.mjs --checks links` → broken links go under `DECISIONS NEEDED` if the target
  page doesn't exist yet).
- Lighthouse SEO ≥95 (`canonical` failing on localhost is expected: it points at the production domain).

## 8 · Forms (`form-auditor`, conditional)

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
- Tests for valid, invalid and pending states.

## 9 · Security (`security-auditor`)

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

## 10 · Error handling (`error-handling-auditor`)

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

## 11 · Code review (`code-reviewer`, read-only)

Skills: `code-review-checklist` (+ the security/a11y/perf cross-checks it names).
Diff: `git diff <base>...HEAD` from the run state. Reviews the whole pipeline's output
with fresh eyes. It reports; the orchestrator applies `must-fix` items, re-runs gates,
and commits `fix(<screen>): address review`. One re-review of the fix diff at most.

## 12 · Final regression (orchestrator)

1. `node $S/gates.mjs --tests --out $Q/12-gates.md` (fresh production build + all tests)
2. `node $S/audit.mjs --routes <route> --original screens/<screen>/Main.dc.html --out $Q/12-audit`:
   every check, including the design capture against the export at 1440/1000/390 on the
   production build. Drop `--original` if the export no longer exists.

Compare with each phase's evidence. A regression (something a phase fixed that is broken
again) → hand it back to the owning phase agent **once**, then re-run this phase. Still
failing → report it. Blocking only for red gates.

## 13 · Report (orchestrator)

`node $S/state.mjs report <screen>` → `$Q/REPORT.md`, then tell the user:
per-phase table, the headline numbers (tests, axe, Lighthouse, headers, capture), every
`DECISIONS NEEDED` item merged and de-duplicated, commits on the branch, and next steps
(review the branch, merge, push). Never push or merge yourself.
