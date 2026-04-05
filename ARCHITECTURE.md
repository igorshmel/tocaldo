# ARCHITECTURE

This document explains project structure and contribution rules so a new coding agent can work safely without turning the repository into a monolith.

## 1) High-Level Overview

- Product: weekly planner/calendar with backlog and drag/edit interactions.
- Backend: Go + PostgreSQL + SQL migrations (goose), serves API and static frontend.
- Frontend: modular ES modules (`js/`), Tailwind v4 + daisyUI v5 styles (`css/tw.css` -> `css/tw.generated.css`).

## 2) Repository Structure

- `cmd/server/`
  - app entrypoint and wiring.
- `internal/`
  - `config/` environment config loading.
  - `models/` API/domain data structs.
  - `handler/http/` HTTP handlers and route-level concerns.
  - `service/` application/business layer.
  - `repository/` repository contracts.
  - `repository/postgres/` postgres implementation.
- `migrations/`
  - goose SQL migrations (source of DB schema/history).
- `js/`
  - `app.js` bootstrap/orchestration only.
  - `api/` API clients.
  - `state/` store/state mutation API.
  - `utils/` pure helpers (date/time).
  - `features/<feature>/` feature modules with local responsibilities.
- `css/`
  - `tw.css` Tailwind+daisyUI source + theme.
  - `tw.generated.css` generated output.
  - `app.css` single stylesheet entry for HTML.
- `index.html`
  - app shell + static markup + module script entry.

## 3) Backend Architecture Rules

Layering rule (strict direction):

`handler -> service -> repository(interface) -> repository/postgres`

- `handler` must not execute SQL.
- `service` must not know HTTP details.
- `repository` interface in `internal/repository` is the boundary.
- Postgres-specific code stays only in `internal/repository/postgres`.

API notes:
- Events endpoints live in `internal/handler/http/event_handler.go`.
- List endpoint supports week-range filtering (`from`/`to`) and includes backlog.

Data notes:
- Event `day` is persisted as:
  - ISO date (`YYYY-MM-DD`) for calendar items.
  - `'backlog'` for backlog items.

## 4) Frontend Architecture Rules

### 4.1 Module boundaries

- `js/app.js`
  - only bootstraps app, composes modules, no heavy logic.
- `js/features/*`
  - each feature encapsulates rendering + interactions for its area.
- `js/utils/*`
  - no DOM mutations, pure deterministic helpers.
- `js/api/*`
  - no UI logic, only network calls.
- `js/state/store.js`
  - centralized state access/mutations.

### 4.2 File-size / complexity guidance

- If a feature file grows too large, split by concern (e.g. `edit`, `drag`, `resize`).
- Prefer many small modules over one large file.
- Avoid circular imports.

### 4.3 Styling rules

- Use utility classes (Tailwind/daisyUI).
- `css/tw.generated.css` is generated; do not edit manually.
- If a style must be precise and hard to express, prefer utility classes first; inline styles only as last resort for strict visual parity.
- `index.html` must include only `css/app.css`.

## 5) Build & Run

### Backend
- `make build` — build Go server.
- `make run` — run server with `.env`.

### Database
- `make db-up` / `make db-down` — postgres via docker compose.
- Migrations run automatically on server startup (goose).

### Frontend styles
- `make tw-build` (or `npm run tw:build`) — compile Tailwind/daisy output.
- `make tw-watch` (or `npm run tw:watch`) — watch mode.

## 6) Safe Change Workflow

When making changes:
1. Keep changes scoped to one layer/feature.
2. Preserve visual parity unless user asks for redesign.
3. Run quick checks:
   - `npm run tw:build`
   - `find js -type f -name '*.js' -print0 | xargs -0 -n1 node --check`
   - backend build in user env (`make build`).
4. Update docs/checklists if architecture or workflow changes.

## 7) Non-Goals / Anti-Patterns

Avoid:
- Adding ad-hoc logic into `app.js` or handler layer.
- Mixing SQL in handlers/services.
- Reintroducing legacy global CSS file sprawl.
- Editing generated CSS directly.
- Silent behavior changes in date/week logic without migration notes.

## 8) If You Are a New Agent

Start here:
1. Read this file and `MIGRATION_PLAN.md`.
2. Inspect `js/app.js` to understand composition.
3. Locate feature folder for your task; change only that slice.
4. Run build/syntax checks before finalizing.
