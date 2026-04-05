#!/usr/bin/env bash
set -Eeuo pipefail

usage() {
    cat <<'HELP'
Deploy tocaldo to system32.ru through mounted sshfs directory.

Usage:
  ./scripts/deploy-system32.sh [options]

Options:
  --no-restart      Do not restart systemd service after switching release
  --no-tw-build     Skip `npm run tw:build`
  --mount-root DIR  Local sshfs mount root (default: ~/mnt/95-163-243-113)
  --ssh HOST        SSH target for restart/check (default: root@95.163.243.113)
  --service NAME    Systemd service name (default: calendar-system32)
  -h, --help        Show this help

Environment overrides:
  MOUNT_ROOT        Same as --mount-root
  REMOTE_SSH        Same as --ssh
  SERVICE_NAME      Same as --service
  REMOTE_MOUNT_BASE Remote path mounted into MOUNT_ROOT (default: /home/admin)
  REMOTE_APP_ROOT   Remote app root (default: /home/admin/web/system32.ru)
HELP
}

die() {
    echo "ERROR: $*" >&2
    exit 1
}

need_cmd() {
    command -v "$1" >/dev/null 2>&1 || die "command not found: $1"
}

RUN_RESTART=1
RUN_TW_BUILD=1

MOUNT_ROOT="${MOUNT_ROOT:-$HOME/mnt/95-163-243-113}"
REMOTE_SSH="${REMOTE_SSH:-root@95.163.243.113}"
SERVICE_NAME="${SERVICE_NAME:-calendar-system32}"
REMOTE_MOUNT_BASE="${REMOTE_MOUNT_BASE:-/home/admin}"
REMOTE_APP_ROOT="${REMOTE_APP_ROOT:-/home/admin/web/system32.ru}"

while [[ $# -gt 0 ]]; do
    case "$1" in
        --no-restart)
            RUN_RESTART=0
            shift
            ;;
        --no-tw-build)
            RUN_TW_BUILD=0
            shift
            ;;
        --mount-root)
            [[ $# -ge 2 ]] || die "--mount-root requires value"
            MOUNT_ROOT="$2"
            shift 2
            ;;
        --ssh)
            [[ $# -ge 2 ]] || die "--ssh requires value"
            REMOTE_SSH="$2"
            shift 2
            ;;
        --service)
            [[ $# -ge 2 ]] || die "--service requires value"
            SERVICE_NAME="$2"
            shift 2
            ;;
        -h|--help)
            usage
            exit 0
            ;;
        *)
            die "unknown option: $1"
            ;;
    esac
done

need_cmd go
need_cmd rsync
need_cmd ssh
need_cmd date

if [[ "$RUN_TW_BUILD" -eq 1 ]]; then
    need_cmd npm
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

[[ -d "$MOUNT_ROOT" ]] || die "mount root does not exist: $MOUNT_ROOT"
[[ "$REMOTE_APP_ROOT" == "$REMOTE_MOUNT_BASE"* ]] || die "REMOTE_APP_ROOT must be inside REMOTE_MOUNT_BASE"

RELATIVE_APP_PATH="${REMOTE_APP_ROOT#"$REMOTE_MOUNT_BASE"/}"
MOUNT_APP_ROOT="$MOUNT_ROOT/$RELATIVE_APP_PATH"

if [[ ! -d "$MOUNT_APP_ROOT" ]]; then
    die "mounted app path not found: $MOUNT_APP_ROOT (mount first: sshfs root@95.163.243.113:/home/admin $MOUNT_ROOT)"
fi
[[ -d "$MOUNT_APP_ROOT/releases" ]] || die "missing releases directory: $MOUNT_APP_ROOT/releases"

TIMESTAMP="$(date +%Y%m%d%H%M%S)"
REMOTE_RELEASE_DIR="$REMOTE_APP_ROOT/releases/$TIMESTAMP"
MOUNT_RELEASE_DIR="$MOUNT_APP_ROOT/releases/$TIMESTAMP"
PREVIOUS_TARGET=""

if [[ -L "$MOUNT_APP_ROOT/current" ]]; then
    PREVIOUS_TARGET="$(readlink "$MOUNT_APP_ROOT/current" || true)"
fi

STAGE_DIR="$(mktemp -d /tmp/system32-deploy.XXXXXX)"
cleanup() {
    rm -rf "$STAGE_DIR"
}
trap cleanup EXIT

echo "[1/5] Building frontend assets"
if [[ "$RUN_TW_BUILD" -eq 1 ]]; then
    (cd "$PROJECT_DIR" && npm run tw:build)
else
    echo "Skipped (flag: --no-tw-build)"
fi

echo "[2/5] Building Linux binary"
(
    cd "$PROJECT_DIR"
    CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o "$STAGE_DIR/calendar-server" ./cmd/server
)

echo "[3/5] Preparing release payload"
for path in index.html css js migrations; do
    [[ -e "$PROJECT_DIR/$path" ]] || die "missing required path: $PROJECT_DIR/$path"
    cp -a "$PROJECT_DIR/$path" "$STAGE_DIR/"
done

echo "[4/5] Uploading to mounted server path"
mkdir -p "$MOUNT_RELEASE_DIR"
rsync -a --delete "$STAGE_DIR/" "$MOUNT_RELEASE_DIR/"
ln -sfn "$REMOTE_RELEASE_DIR" "$MOUNT_APP_ROOT/current"

echo "[5/5] Restarting service"
if [[ "$RUN_RESTART" -eq 1 ]]; then
    if ! ssh "$REMOTE_SSH" "systemctl restart $SERVICE_NAME && systemctl is-active $SERVICE_NAME >/dev/null"; then
        echo "Restart failed, rolling back symlink" >&2
        if [[ -n "$PREVIOUS_TARGET" ]]; then
            ln -sfn "$PREVIOUS_TARGET" "$MOUNT_APP_ROOT/current"
            ssh "$REMOTE_SSH" "systemctl restart $SERVICE_NAME" || true
        fi
        exit 1
    fi
    ssh "$REMOTE_SSH" "systemctl --no-pager --full status $SERVICE_NAME | sed -n '1,20p'"
else
    echo "Skipped (flag: --no-restart)"
fi

echo "Deploy completed."
echo "Release: $REMOTE_RELEASE_DIR"
