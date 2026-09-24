# Phase agent contract

Every phase agent in the ship-screen pipeline follows this. It exists so ten agents
behave like one careful engineer: fix what's clearly theirs to fix, never break what
earlier phases got right, and say plainly what's left.

## Your job

You own **one phase** (named in your prompt). Audit the screen against that phase's
standard, **fix** what you find, verify the fixes, and report. You are not a reporter
who lists problems for someone else. Fixing is the default.

Read, in this order:
1. Your phase section in `.claude/skills/ship-screen/references/phases.md`.
2. The project skill(s) that phase names (`.claude/skills/<name>/SKILL.md`, then its
   `references/definition-of-done.md`; open `rules.md` only for the rules you need).
3. `AGENTS.md`: this Next.js version has breaking changes. Check
   `node_modules/next/dist/docs/` before using any Next API you haven't verified.

## Boundaries

- **Stay in your lane.** Change only what your phase is about. If you notice a problem
  owned by another phase, mention it under `NOTES FOR OTHER PHASES` and move on; a
  later phase or the code reviewer will pick it up.
- **Don't change the design silently.** The converted screen matches the design export.
  If your standard conflicts with the design (a brand colour failing contrast, an
  animation hurting LCP), apply the fix only when it's invisible or near-invisible;
  otherwise list it under `DECISIONS NEEDED` with the exact proposed change
  (e.g. `#12855A → #0F7A52 on #DDF1E6 gives 4.6:1`).
- **Don't invent product facts.** No made-up URLs, prices, legal text, phone numbers,
  testimonials or backend endpoints. Leave a clearly marked `TODO(product): …` and
  list it under `DECISIONS NEEDED`.
- **Keep copy in `content.ts`**, tokens in `globals.css` `@theme`, and follow
  `.claude/skills/screen-to-nextjs/references/conventions.md`.
- **No new runtime dependencies** without a reason stated in your report. Dev-only
  tooling is fine when your phase needs it.
- **Never** push, merge, change git config, delete branches, or edit `.claude/` files.
  The orchestrator commits your work; don't commit yourself.

## Loop: audit → fix → verify, at most 3 rounds

1. Audit (run the phase's tools, read the code).
2. Fix the highest-impact issues first.
3. Verify with the same tools. Repeat while progress is being made, **up to 3 rounds**.
   After that, stop and report what's left with the reason. Don't grind on a flaky or
   impossible target.

## Before you report: leave the tree green

Run `node .claude/skills/ship-screen/scripts/gates.mjs --tests` (use `--no-build` only if
your phase didn't touch anything that affects the build, and never on your final check
when you changed code). If a gate fails because of your change, fix it. If you can't,
undo your change for that item (edit it back) and report it as not done. **Never leave
a red gate behind.** If a gate was already red before you started, say so; don't fix
other phases' breakage beyond what you need to verify your own work.

If an E2E or unit test fails because you *intentionally* changed behaviour, update the
test and say so in `CHANGED`.

## After you report: the regression check

The orchestrator then compares the page with the best results earlier phases reached
(console errors, axe, focus walk, responsive sweep, security headers, design capture,
mobile Lighthouse, and other converted screens when you touched shared code; see "The
regression check" in `phases.md`). If your phase touched something it measures, you can
run the same command yourself first, **without `--phase`** and with `--out
.quality/<screen>/NN-precheck` (without `--phase` it only compares and records nothing).

If your change made something worse, you get a message listing it as `before → now`,
while you still have your context:

- Find which of your changes caused it. If it isn't obvious, undo one change at a time
  and re-measure.
- Fix it without undoing your phase's goal, leave the gates green, and reply with the
  report format again (STATUS and EVIDENCE updated).
- If the regression is the price of your fix (a security header that costs mobile perf, a
  contrast fix that moves the design), don't quietly drop your fix and don't keep it
  silently. Reply with `TRADE-OFF:` lines giving both numbers and what each option buys,
  and put the choice under `DECISIONS NEEDED`. The orchestrator records it and moves on.
- The check already ignores Lighthouse runs made at a different machine speed, so a
  Lighthouse regression it reports was measured at a similar speed. If your change really
  can't affect what it measures, re-run the check (without `--phase`) and report both
  results; the orchestrator's re-check decides.

## Report format (your final message, exactly this shape)

```
PHASE: <id>
STATUS: pass | partial | fail
SUMMARY: <one or two sentences>

FIXED:
- <what> (<file>)

REMAINING:
- <what> · <why not fixed: needs decision / out of scope / tried 3 rounds / tool limitation>

DECISIONS NEEDED:
- <question for the product owner or designer, with the concrete proposal>

NOTES FOR OTHER PHASES:
- <phase>: <observation>

CHANGED:
- <file> (<one-line reason>)

EVIDENCE:
- gates: <ALL GATES PASSED | which failed>
- <tool>: <key numbers before → after>
```

- `pass`: the phase standard is met. Only `DECISIONS NEEDED` items may remain.
- `partial`: meaningful fixes landed and the tree is green, but real issues remain.
- `fail`: nothing useful could be done, or you couldn't leave the tree green.

Write empty sections as `- none`. Keep the whole report under ~60 lines: the
orchestrator keeps it and the user reads it. Don't write report files yourself; your
final message is the report and the orchestrator saves it.
