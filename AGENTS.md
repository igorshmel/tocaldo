# AGENTS.md

This file defines mandatory rules for any agent working in this repository.
Read this first, then read `ARCHITECTURE.md`.

## 0) Source Of Truth

- Architecture and module boundaries: `ARCHITECTURE.md`
- Frontend styling rules (Tailwind/daisyUI specifics): `instr.txt`
- Migration status and parity constraints: `MIGRATION_PLAN.md`
- Regression checklist: `UI_REGRESSION_CHECKLIST.md`

If instructions conflict, prefer:
1. explicit user request,
2. `ARCHITECTURE.md`,
3. this file.

## 1) Core Principles

- Keep code modular; avoid monolithic files.
- Preserve current UI visual parity unless user explicitly asks for redesign.
- Make minimal, scoped changes.
- Document any behavior changes.

## 2) Backend Rules (Go)

### Required
- Follow layer direction strictly:
  - `handler -> service -> repository interface -> postgres adapter`
- Keep SQL only in `internal/repository/postgres`.
- Keep HTTP concerns only in `internal/handler/http`.
- Keep migrations in `migrations/` (goose format).
- Respect event day semantics:
  - calendar events: `YYYY-MM-DD`
  - backlog events: `backlog`

### Forbidden
- No SQL in handlers/services.
- No bypassing service layer from handlers.
- No schema changes without migration.

## 3) Frontend Rules

### Required
- Follow `instr.txt` for UI construction and Tailwind/daisyUI usage.
- Keep `js/app.js` as orchestration/bootstrap only.
- Put logic in feature modules under `js/features/`.
- Keep API calls in `js/api/`, state in `js/state/`, pure helpers in `js/utils/`.
- Use `css/app.css` as the only stylesheet entry in HTML.
- Edit `css/tw.css` for theme/config; never hand-edit `css/tw.generated.css`.
- Prefer utility classes; inline style only when required for strict parity.

### Forbidden
- Reintroducing large legacy global CSS files.
- Adding new unrelated logic into `app.js`.
- Mixing feature concerns in one file when split is natural.
- Unapproved visual redesign.

## 4) Visual Parity Policy

When changing UI:
1. Implement in small slices.
2. Verify no shifts in spacing, sizing, colors, alignment.
3. If visual drift appears, fix immediately before further migration.

Do not proceed to next migration block if current block is visually unstable.

## 5) File Hygiene

- Keep files focused and reasonably small.
- Remove dead/duplicate code after safe migration.
- Archive stale artifacts instead of leaving noisy copies in root.

## 6) Validation Checklist Before Finalizing

Run what is available in environment:
- `npm run tw:build`
- `find js -type f -name '*.js' -print0 | xargs -0 -n1 node --check`
- `make build` (when Go is available)

Also verify key user flows from `UI_REGRESSION_CHECKLIST.md`.

## 6.1) Definition Of Done (DoD)

A task is done only if all are true:
- Code follows layer/module boundaries from `ARCHITECTURE.md`.
- No unintended visual drift (unless explicitly requested).
- Required validations were executed and reported.
- Docs/checklists are updated if architecture/workflow changed.
- No obvious dead code or duplicated logic left behind.

## 6.2) Testing Policy

- Frontend-only changes:
  - run Tailwind build,
  - run JS syntax checks,
  - run relevant manual checks from `UI_REGRESSION_CHECKLIST.md`.
- Backend-only changes:
  - `make build`,
  - run/update DB migration if schema changed,
  - verify affected API route behavior.
- Full-stack changes:
  - run both frontend and backend checks above.

### Test Philosophy (mandatory)

- Tests are the cement of the project and must prevent code drift/regressions.
- New/important features and meaningful refactors must include appropriate test coverage.
- If tests fail after a change, first assume the code is wrong and investigate/fix code before changing tests.
- Do not edit tests just to make CI green.
- If old tests fail due to an intentionally changed behavior, test updates must be explicitly included in the task scope/requirements.
- If behavior change was not planned, restore old behavior by fixing code and keep existing tests passing.
- Exception: if a test is proven incorrect/flaky (not a real product contract), it may be fixed with explicit written rationale in the change summary.

## 7) Change Communication

In final update to user, include:
- what changed,
- exact files touched,
- whether parity is preserved,
- what to verify next (if needed).

After important refactors or new feature additions, update `ARCHITECTURE.md` accordingly (structure, boundaries, and workflow changes).

## 8) Safety Constraints

- Do not use destructive git/file operations unless explicitly requested.
- Do not rewrite broad areas when a local fix is enough.
- Ask before making product-level behavior changes.

## 8.1) API Contract Discipline

- Do not rename/remove JSON fields used by frontend without migration plan.
- Keep stable request/response formats for existing endpoints.
- For breaking API changes, add explicit transition notes and update docs.

## 8.2) Database Migration Discipline

- Every schema/data change must be in a new goose migration file.
- Migration files must include proper goose directives (`-- +goose Up` / `-- +goose Down`).
- Prefer reversible `Down` steps where feasible; if irreversible, state it explicitly.
- Consider both empty DB and existing data when writing migrations.

## 8.3) Performance & Maintainability Guardrails

- Avoid large files growing unchecked; split by concern when complexity rises.
- Avoid repeated DOM full re-renders unless justified by simplicity/scope.
- Reuse existing utilities/features before introducing parallel logic paths.
- Do not add one-off styling hacks when a reusable utility pattern is possible.

## 9) Quick Start For New Agent

1. Read `ARCHITECTURE.md`.
2. Read this file.
3. Read `instr.txt` before frontend changes.
4. Find target feature folder and edit only relevant modules.
5. Run validation commands and report results.
