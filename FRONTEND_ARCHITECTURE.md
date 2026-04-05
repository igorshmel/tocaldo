# Frontend Architecture Rules

## Goals
- Keep UI code modular and easy to evolve.
- Prevent monolithic files and style sprawl.
- Keep behavior and styling concerns separated.

## Folder Structure
- `js/app.js` — bootstrap/orchestration only.
- `js/state/` — state container and mutations.
- `js/api/` — HTTP clients only.
- `js/utils/` — pure helpers (date/time/etc.).
- `js/features/<feature>/` — feature-local modules.
- `css/` — style entry points and temporary legacy styles.

## JS Design Rules
- Keep modules small and focused.
- Prefer pure functions for utils and transformations.
- Feature module public API must be explicit (`index.js`).
- No direct API calls from render-only modules.
- UI event binding lives inside feature modules, not in global scope.

## Styling Rules (during migration)
- Tailwind + daisyUI is the target styling approach.
- Use `css/app.css` as the single stylesheet entry point.
- Keep generated output in `css/tw.generated.css`; do not edit it manually.
- Keep reusable styling in templates via utility classes.
- Avoid adding new large custom CSS sections.

## Review Checklist
- Is this change in the correct feature folder?
- Did any file become too large (>250 lines) without a strong reason?
- Can the behavior be tested in isolation?
- Did we avoid introducing one-off styles that bypass theme tokens?
