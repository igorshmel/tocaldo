# UI Regression Checklist

## Core Layout
- [x] Planner container renders correctly on desktop.
- [x] Sidebar width and spacing remain unchanged.
- [x] Calendar columns keep original proportions.

## Calendar Behavior
- [x] Current day highlight works.
- [x] Week navigation arrows work both directions.
- [x] Monday/Sunday edge-case layout still works.

## Events
- [x] Create event from backlog color buttons works.
- [x] Backlog event edit works (including Ctrl+Shift layout switch behavior).
- [x] Backlog delete button works.
- [x] Drag backlog -> calendar works.
- [x] Drag calendar -> backlog works.
- [x] Resize calendar event works.
- [x] Overlap prevention still works.

## Data
- [x] Events load from API for selected week range.
- [x] Create/update/delete persists in DB.
- [x] Switching weeks loads corresponding events.

## Responsive
- [x] Main UI remains usable on mobile width.
- [x] No broken horizontal overflow in sidebar.

## Visual Parity
- [x] Colors match baseline.
- [x] Header/button/card shapes match baseline.
- [x] Typography sizes/weights match baseline.

## Automated Validation (done in CLI)
- [x] All frontend JS modules pass syntax check (`node --check`).
- [x] Tailwind/daisy build succeeds (`npm run tw:build`).
- [x] Backend build succeeds (`make build`).
