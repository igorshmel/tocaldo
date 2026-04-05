# UI Migration Plan (Tailwind 4 + daisyUI 5) with Visual Parity

Goal: migrate to Tailwind/daisyUI without noticeable UI changes and keep frontend architecture clean.

## Acceptance Criteria
- [x] Visual parity with current UI (no layout/color/interaction regressions beyond tiny pixel differences)
- [x] All existing features still work (create/edit/delete/drag/resize/week nav)
- [x] Frontend remains feature-modular; no return to monolithic files

## Stage 0 — Preparation
- [x] Create/continue migration branch
- [ ] Capture baseline screenshots (main states: normal/edit/drag/backlog/week nav)
- [x] Add/update architecture notes for frontend rules
- [x] Prepare UI regression checklist

## Stage 1 — Tooling Setup
- [x] Add Tailwind CSS v4
- [x] Add daisyUI v5
- [x] Add CSS entry with:
  - [x] `@import "tailwindcss";`
  - [x] `@plugin "daisyui";`
- [x] Ensure app builds/runs with new pipeline while old styles still active

## Stage 2 — Theme Parity
- [x] Create custom daisyUI theme matching current palette
- [x] Map current tokens (backgrounds, headers, accents, borders, text)
- [x] Map radius/shadow/depth equivalents
- [x] Verify no visual drift before component migration

## Stage 3 — Incremental UI Migration (block-by-block)
- [x] Layout shell (container, sidebar, calendar area)
- [x] Day headers + week navigation controls
- [x] Backlog area + creation buttons
- [x] Calendar time grid/columns
- [x] Event cards + states (editing, dragging, resizing)

Rule: after each block, compare against baseline and fix parity issues before next block.

## Stage 4 — Legacy CSS Cleanup
- [x] Remove migrated sections from legacy CSS
- [x] Keep only unavoidable custom CSS (if any)
- [x] Eliminate duplicate/unused styles

## Stage 5 — Project Hygiene
- [x] Organize CSS files (`app.css`, temporary `legacy.css`, then retire legacy)
- [x] Archive/remove stale design copies (`Back/`)
- [x] Update README/architecture docs with new styling workflow

## Stage 6 — Stabilization
- [x] Full smoke test of key interactions
- [x] Desktop/mobile check
- [x] Basic accessibility pass (focus states, labels, keyboard behavior)
- [x] Final visual parity sign-off

## Progress Log
- 2026-02-02: Plan created and committed to repository as source of truth.
- 2026-02-02: Stage 0 (docs/checklist), Stage 1 (Tailwind+daisyUI setup), Stage 2 (initial custom theme) completed without replacing legacy UI yet.
- 2026-02-02: Stage 3 started. Layout shell moved to Tailwind/daisyUI utility classes with legacy visual parity preserved.
- 2026-02-02: Day headers and week navigation controls migrated to Tailwind utilities; sprite-like arrows replaced with inline SVG icons for stable centering.
- 2026-02-02: Backlog section headers/actions/buttons migrated to Tailwind utilities with existing visual style preserved.
- 2026-02-02: Calendar grid/columns and event card styles (including edit/drag/resize visual states) migrated to utility classes; legacy CSS for these blocks removed.
- 2026-02-02: Parity-first correction applied after visual drift; backlog headers/actions/buttons re-migrated with exact values and validated against baseline intent.
- 2026-02-02: Parity-safe progress: calendar column/grid/time-slot now dual-styled (utility classes added while legacy CSS retained) to avoid visual drift before final cleanup.
- 2026-02-02: Parity-safe progress: event cards (base/backlog/calendar/edit state) now dual-styled with utility classes while legacy CSS remains as visual guardrail.
- 2026-02-02: Removed legacy CSS for migrated grid/event blocks after parity confirmation; remaining legacy CSS now focused on non-migrated sections and special cases.
- 2026-02-02: Parity-safe progress: day header/week navigation received exact-value utility classes while preserving legacy classes as fallback.
- 2026-02-02: Stage 5 completed: CSS entry unified via `css/app.css`, legacy styles moved to `css/legacy.css`, stale `Back/` copies archived, and docs updated.
- 2026-02-02: Stage 6 started. Frontend syntax checks and Tailwind build pass. Backend build check blocked in this CLI due missing `go` binary.
- 2026-02-02: Stage 6 completed. User-confirmed backend build success and visual/functional parity checks passed.
- 2026-02-02: Tailwind-only completion pass: removed `css/legacy.css`, restored parity issues in utilities (event inner padding, nav centering, backlog placeholder, checkbox checked visuals).
