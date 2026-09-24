---
name: ship-screen
description: End-to-end pipeline that takes a design export in `screens/<screen>/` to production-ready Next.js code and then hardens it in a fixed order (convert → build gate → forms → tests → structure/tokens/types → accessibility → SEO/GEO/AEO → security → error handling → performance → code review → final regression → report), each phase run by a dedicated subagent that audits, fixes, verifies and commits on a feature branch, with a regression check after every phase. Use this whenever the user wants a screen converted, built, shipped or "made production ready", runs `/screen-to-nextjs` or `/ship-screen`, says "convert screens/pricing", "run the full pipeline on the homepage", "quality-check / harden / audit this screen", or asks to re-run one phase ("just the a11y and perf phases on /about"). Prefer this over invoking the individual quality skills one by one for anything under `screens/` or an already-converted screen.
---

# ship-screen

One command, one sequence: a design export becomes a converted, tested, accessible,
fast, discoverable, secure, reviewed screen, with every phase's evidence on disk and
every fix committed on a feature branch the user can review.

You are the **orchestrator**. You don't do the phase work yourself: each phase runs in
a subagent with a fresh context (conversion alone can fill a context window, and a
reviewer who wrote the code can't review it). Your job is sequencing, verification,
commits and the final story. Keep your own context lean: read reports, not code.

## Usage

```
/ship-screen <screen> [flags]        e.g. /ship-screen homepage --no-convert
/screen-to-nextjs <screen>           hands over to this pipeline (see that skill)
```

| flag | effect |
|---|---|
| `--no-convert` | Screen is already converted: skip phase 1 (and the design capture if the export is gone) |
| `--from <phase>` | Resume from a phase (reads `.quality/<screen>/run.json`) |
| `--only <p1,p2>` | Run just these phases (plus the build gate before them) |
| `--skip <p1,p2>` | Skip phases (recorded as skipped in the report) |
| `--budget <k=v,…>` | Lighthouse and JS budget overrides, e.g. `mobile.perf=85,desktop.lcp=2000,weight.js=230` |
| `--fix-contrast` | Let the a11y phase apply AA-compliant colour replacements instead of only proposing them |
| `--desktop-only` | The screen has no mobile board and none is coming: pre-flight doesn't ask about one, and the phone layout is derived from the desktop board |
| `--no-commit` | Don't commit per phase. Everything stays in the working tree, and there's no rollback point, so the run **stops at the first failed phase** instead of parking it |

Phase ids: `preflight convert build forms tests structure a11y seo security errors perf review final report`
(`node .claude/skills/ship-screen/scripts/state.mjs phases` prints the table).

## Before you start

Tell the user in one or two lines what will happen: which screen and route, its design
boards (desktop only, or desktop + mobile, from `boards.mjs` in pre-flight), the branch,
that it runs ~13 phases sequentially and can take an hour or more, and that each phase
commits to the branch (unless `--no-commit`). Then go. Don't ask for confirmation
unless something below says to.

Read once: `references/phases.md` (what each phase does and its pass criteria). Agents
read `references/phase-contract.md` themselves; you only need its report format.

## The loop

For each phase in order (respecting `--from/--only/--skip`; `forms` runs only when
`node .claude/skills/ship-screen/scripts/scan.mjs --paths src/features/<screen>` reports
form controls, otherwise it's recorded as skipped):

1. `node .claude/skills/ship-screen/scripts/state.mjs start <screen> <phase>`
2. **Run it**:
   - Orchestrator phases (`preflight`, `build`, `final`, `report`): do them yourself
     exactly as `phases.md` describes.
   - Agent phases: spawn the phase's agent (table below) with the Agent tool, in the
     **foreground** (`run_in_background: false`; the next phase depends on it), using
     the prompt template below.
3. **Save the report**: write the agent's final message verbatim to
   `.quality/<screen>/NN-<phase>.md` (NN = phase number, zero-padded).
4. **Verify, don't trust**: run `node .claude/skills/ship-screen/scripts/gates.mjs --tests`
   yourself (a test gate is reported as skipped while it has no test files yet). The agent's
   claim of green isn't evidence; this is.
5. **Check for regressions** (agent phases, gates green): unless the phase changed
   nothing or only test files, run the regression check on the build the gates just made
   (details and noise allowances: "The regression check" in `phases.md`):

   ```
   node .claude/skills/ship-screen/scripts/audit.mjs --quick --routes <route> \
     --original screens/<screen>/Main.dc.html --baseline .quality/<screen>/baseline.json \
     --phase <id> --out .quality/<screen>/NN-check
   ```

   Drop `--original` if the export is gone; after `perf`, add `--modes mobile,desktop`.
   Keep `--original` pointing at the desktop board: the capture finds the other boards and
   compares 390 with the mobile board itself.
   - Exit 0 → no regressions; settle the phase.
   - Exit 1 → it lists each regression as `before → now`. Continue the **same** agent
     with `SendMessage` (it still has its context) and paste the list: `Regression check
     after your phase: <list>. Fix it without undoing your phase's work, or reply with
     TRADE-OFF: and the numbers on both sides.` Then run gates and the check again.
     - Clean now → settle the phase.
     - Trade-off → add it to the decisions with both numbers, accept it into the baseline
       with `node .claude/skills/ship-screen/scripts/baseline.mjs accept .quality/<screen>/NN-check/audit.json .quality/<screen>/baseline.json --phase <id> --note "<what and why>"`,
       and settle the phase with the trade-off in its note.
     - Still regressed and no trade-off → treat it like red gates: park the attempt.

   **Other screens.** If `node .claude/skills/ship-screen/scripts/screens.mjs shared-changes <screen>`
   prints any file, the phase touched code that other converted screens use. Run the
   other-screens check too ("Other screens" in `phases.md`, `--out .quality/<screen>/NN-others`)
   and handle its regressions the same way (a trade-off is accepted into `baseline-others.json`).
6. **Settle the phase**:
   - Gates green and the agent changed files → commit (see Commits), then
     `state.mjs set <screen> <phase> <status> --note "<one line>" --commit <sha>`.
   - Gates green, nothing changed → `state.mjs set … <status> --note …`.
   - Gates red, or `STATUS: fail` with changes → **park the attempt** (see Failure
     handling), mark the phase `fail`, and continue if the phase is non-blocking. Stop if
     it's blocking (`preflight`, `convert`, `build`, `final`).
7. **Tell the user** one line: `✅ 6/13 a11y: pass, 3 axe issues fixed, 1 decision needed`
   (add `, 1 regression fixed` or `, 1 trade-off` when the check had something to say).
   Don't paste the whole report.

| phase | agent (`subagent_type`) | skills it applies |
|---|---|---|
| 1 convert | `screen-converter` | screen-to-nextjs |
| 3 forms | `form-auditor` | form-handling-validation |
| 4 tests | `test-engineer` | testing-frontend |
| 5 structure | `architecture-auditor` | component-architecture, design-tokens, typescript-patterns |
| 6 a11y | `a11y-auditor` | accessibility, animation-motion |
| 7 seo | `seo-auditor` | seo-metadata |
| 8 security | `security-auditor` | security-practices |
| 9 errors | `error-handling-auditor` | error-observability |
| 10 perf | `perf-auditor` | performance-optimization |
| 11 review | `code-reviewer` | code-review-checklist |

If an agent type isn't available in this session (agents added after the session
started aren't registered), spawn `general-purpose` instead and start its prompt with
the body of `.claude/agents/<agent>.md`, followed by the template below.

### Agent prompt template

```
You are the <agent> for phase <n> (<id>) of the ship-screen pipeline.

Screen: <screen> · route: <route> · branch: <branch> · base commit: <sha>
Design boards: <from pre-flight, e.g. "desktop Main.dc.html 1440 · phone mobile/Main.dc.html 390 · state mobile/Menu-open.dc.html", or "desktop only">
Output folder for tool results: .quality/<screen>/  (prefix files with <NN>-)
Flags: <flags or "none"> · Lighthouse budgets: <defaults or overrides>

Earlier phases:
- <n> <id>: <status>, <one-line note>
  …
Open decisions so far: <short list, starting with the build gate's broken links, or "none">

Read .claude/skills/ship-screen/references/phase-contract.md first, then the
"<n> · <title>" section of .claude/skills/ship-screen/references/phases.md.
Do the phase: audit, fix, verify, leave the gates green. Don't commit.
Finish with the report format from the contract.
```

Phase-specific additions:
- **convert**: `Follow .claude/skills/screen-to-nextjs/SKILL.md end to end for screens/<screen>. You are the pipeline's converter: do not start the pipeline yourself. Use port 3100 for the dev server and stop it when done. Include the boards table, the conversion plan table and the final capture table in your report.` If `src/features/<screen>` already exists, add: `This is a re-sync: follow "Re-syncing an updated export", changing only what the new or updated board changes.`
- **review**: `Review: git diff <base>...HEAD. Report only; don't edit files.` Then apply its
  `must-fix` items yourself (small, targeted edits), run gates and the regression check
  (`--phase review`, plus the other-screens check if the fixes touch shared code), commit
  `fix(<screen>): address code review`, and optionally one re-review of that fix diff.
- **regression fix** (from phase 12): `Regression mode: this broke again after your phase: <evidence>. Fix only this.`

## Commits

After each phase with changes and green gates, on the feature branch:

```
git add -A
git commit -m "<type>(<screen>): <phase> - <one-line summary>"
```

Types: `feat` (convert), `test` (tests), `refactor` (structure), `fix` (a11y, perf, seo, forms,
security, errors, review), `chore` (tooling). **No `Co-Authored-By` or other attribution
trailer** (project convention). Never push, merge, rebase, or amend. `.quality/` is gitignored.

## Failure handling

Never leave the branch red, and never throw work away:

```
git switch -c ship-screen/<screen>/<phase>-attempt
git add -A && git commit -m "wip(<screen>): failed <phase> attempt (parked)"
git switch <feature-branch>
```

The feature branch is back at its last green commit; the attempt is kept for the user.
Mention parked branches in the final report.

Before parking a blocking phase, give its agent **one** chance to fix: continue the same
agent with `SendMessage` (it keeps its context) and paste the failing gate output. Still
red → park, stop the run, tell the user what failed, where the evidence is, and how to
resume (`/ship-screen <screen> --from <phase>`).

Only one pipeline runs per checkout at a time: phases share the working tree, ports
3100 (E2E) and the build output. Stop any dev server on port 3100 before phase 3.

## Decisions

Agents list `DECISIONS NEEDED` instead of guessing: design-colour contrast fixes, missing
page URLs, backend endpoints, legal copy, analytics or monitoring vendors. Collect them
across phases (pass them forward in the prompt so later agents don't re-raise them) and
present them once, de-duplicated, at the end. Don't stop the pipeline to ask. The
exceptions are pre-flight problems (dirty tree, unclear route, a mobile board that may be
coming) and blocking failures.

**Design decisions early.** Once the a11y phase is settled, every decision the design team
must answer is known: contrast shades, colour drift, deviations from a board, a section the
mobile board leaves out, designer copy. If there are any, show them to the user once as a
short interim list, then carry on without waiting. The designers can answer while the
remaining phases run, instead of after the whole run (~2¾ hours on the trial). The end
report still lists them. To give the designers something to look at, also write the list
to `.quality/<screen>/DECISIONS.md` and run
`node .claude/skills/ship-screen/scripts/review-pack.mjs <screen>`. It builds an interim
`DESIGN-REVIEW.html` from the latest capture, and the report phase rebuilds it at the end.

## Ending

Phase 13 writes `.quality/<screen>/REPORT.md`. Your final message to the user:

1. The phase table (status + one-line note each).
2. Headline evidence:
   - tests (count, pass, including the iPhone project)
   - axe (violations), focus walk (hidden stops, traps), responsive sweep (widths that
     scroll sideways, landscape)
   - Lighthouse desktop/mobile (perf, LCP, CLS, TBT) and first-load JS (KB against the budget)
   - Safari (errors, layout vs Chromium) and security headers
   - design capture drift, missing design copy, state boards, other screens
   - gates, and any regression the per-phase check caught (fixed, or accepted as a trade-off)
3. **The design review pack**: the path to `.quality/<screen>/DESIGN-REVIEW.html` and how many
   items it lists first, so the user can forward it to the design team.
4. **Decisions needed**: merged list, each with the concrete proposal.
5. Branch, commits, any parked attempts, and next steps: review the branch, merge into
   the main branch, push. After the push, CI (`.github/workflows/ci.yml`) re-runs the same
   gates plus the JS-budget and header audit. Offer to do the merge; never push.

Keep it scannable. The detail lives in `.quality/<screen>/`.
