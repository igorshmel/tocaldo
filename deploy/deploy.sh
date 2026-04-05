#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

REMOTE_HOST="${REMOTE_HOST:?set REMOTE_HOST}"
REMOTE_USER="${REMOTE_USER:-root}"
REMOTE_PORT="${REMOTE_PORT:-22}"
REMOTE_APP_DIR="${REMOTE_APP_DIR:-/home/admin/web/system32.ru}"
REMOTE_SHARED_DIR="${REMOTE_SHARED_DIR:-${REMOTE_APP_DIR}/private}"
REMOTE_RELEASES_DIR="${REMOTE_RELEASES_DIR:-${REMOTE_APP_DIR}/releases}"
REMOTE_CURRENT_DIR="${REMOTE_CURRENT_DIR:-${REMOTE_APP_DIR}/current}"
REMOTE_ENV_PATH="${REMOTE_ENV_PATH:-${REMOTE_SHARED_DIR}/.env}"
REMOTE_SERVICE="${REMOTE_SERVICE:-calendar-system32}"

APP_NAME="${APP_NAME:-calendar-server}"
BUILD_DIR="${ROOT_DIR}/.deploy_build"

echo "==> Building backend"
(
  cd "${ROOT_DIR}"
  CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o "${BUILD_DIR}/${APP_NAME}" ./cmd/server
)

echo "==> Building frontend styles"
(
  cd "${ROOT_DIR}"
  npm run tw:build
)

echo "==> Preparing release bundle"
rm -rf "${BUILD_DIR}/release"
mkdir -p "${BUILD_DIR}/release"
cp -a "${ROOT_DIR}/index.html" "${BUILD_DIR}/release/"
cp -a "${ROOT_DIR}/css" "${BUILD_DIR}/release/"
cp -a "${ROOT_DIR}/js" "${BUILD_DIR}/release/"
cp -a "${ROOT_DIR}/migrations" "${BUILD_DIR}/release/"
cp -a "${BUILD_DIR}/${APP_NAME}" "${BUILD_DIR}/release/"

RELEASE_ID="$(date +%Y%m%d%H%M%S)"
REMOTE_RELEASE_PATH="${REMOTE_RELEASES_DIR}/${RELEASE_ID}"

echo "==> Uploading release to ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_RELEASE_PATH}"
ssh -p "${REMOTE_PORT}" "${REMOTE_USER}@${REMOTE_HOST}" "mkdir -p '${REMOTE_RELEASE_PATH}' '${REMOTE_SHARED_DIR}'"
rsync -az --delete -e "ssh -p ${REMOTE_PORT}" "${BUILD_DIR}/release/" "${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_RELEASE_PATH}/"

echo "==> Linking current release"
ssh -p "${REMOTE_PORT}" "${REMOTE_USER}@${REMOTE_HOST}" "ln -sfn '${REMOTE_RELEASE_PATH}' '${REMOTE_CURRENT_DIR}'"

echo "==> Ensuring env is in place"
ssh -p "${REMOTE_PORT}" "${REMOTE_USER}@${REMOTE_HOST}" "test -f '${REMOTE_ENV_PATH}' || echo 'Missing ${REMOTE_ENV_PATH}'"

echo "==> Restarting service ${REMOTE_SERVICE}"
ssh -p "${REMOTE_PORT}" "${REMOTE_USER}@${REMOTE_HOST}" "systemctl daemon-reload && systemctl restart '${REMOTE_SERVICE}' && systemctl --no-pager --full status '${REMOTE_SERVICE}' | head -n 50"

echo "==> Done"
