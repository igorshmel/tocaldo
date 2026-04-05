# tocaldo

Weekly planner app with Go backend + PostgreSQL and modular frontend.

## Run
- Start DB: `make db-up`
- Install Go deps: `make tidy`
- Install frontend tooling (once): `npm install`
- Build Tailwind CSS: `make tw-build`
- Start server: `make run`

## Deploy
- Generic SSH deploy (existing flow): `make deploy REMOTE_HOST=95.163.243.113 REMOTE_SERVICE=calendar-system32`
- Deploy via mounted sshfs path (`~/mnt/95-163-243-113`): `make deploy-mount`
- Script options: `./scripts/deploy-system32.sh --help`

## Frontend styling workflow
- Tailwind/daisyUI build output: `css/tw.generated.css`
- Main stylesheet entry: `css/app.css`
- HTML should include only `css/app.css`
 - Theme/input source: `css/tw.css`

## Frontend architecture
See `FRONTEND_ARCHITECTURE.md` and `MIGRATION_PLAN.md`.
