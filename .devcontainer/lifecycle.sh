#!/usr/bin/env bash
# Single entry point for every dev container lifecycle hook, so the ordering
# and the reason each step lives where it does stay readable in one file.
#
#   on-create      once, at creation, before repo content is finalized
#   update-content at creation and whenever prebuild content refreshes
#   post-create    once, after creation and content are done
#   post-start     every container start (including restarts of an existing one)
#   post-attach    every time a client attaches -- keep this fast
set -euo pipefail

STAGE="${1:?usage: lifecycle.sh <on-create|update-content|post-create|post-start|post-attach>}"

CLAUDE_DIR="${CLAUDE_CONFIG_DIR:-$HOME/.claude}"
HISTORY_DIR=/commandhistory
NODE_MODULES=/workspace/node_modules
ZSHRC="$HOME/.zshrc"
MARKER="# >>> devcontainer history <<<"

log() { printf '\033[1;34m[%s]\033[0m %s\n' "$STAGE" "$*"; }

# The image seeds these volumes with dev ownership, but a volume created by an
# older revision of this config can still be root-owned. Cheap and idempotent.
claim_volumes() {
  local d
  for d in "$CLAUDE_DIR" "$HISTORY_DIR" "$NODE_MODULES"; do
    [ -d "$d" ] || continue
    [ -O "$d" ] && continue
    log "claiming $d"
    sudo -n chown -R "$(id -u):$(id -g)" "$d" || log "WARN: could not chown $d"
  done
}

on_create() {
  claim_volumes

  # Sizes and setopts only; HISTFILE itself is handled by the symlinks baked
  # into the image, which no .rc file can override.
  if ! grep -qF "$MARKER" "$ZSHRC" 2>/dev/null; then
    log "configuring zsh history"
    cat >>"$ZSHRC" <<'ZRC'

# >>> devcontainer history <<<
HISTSIZE=100000
SAVEHIST=100000
setopt APPEND_HISTORY INC_APPEND_HISTORY SHARE_HISTORY HIST_IGNORE_DUPS
ZRC
  fi

  # The workspace is a bind mount from macOS; uid mapping can make git call it
  # "dubious ownership" and refuse to run.
  git config --global --add safe.directory "$PWD" 2>/dev/null || true
}

update_content() {
  if [ -f pnpm-lock.yaml ]; then
    log "pnpm install --frozen-lockfile"
    pnpm install --frozen-lockfile
  elif [ -f package.json ]; then
    log "pnpm install (no lockfile yet)"
    pnpm install
  else
    log "no package.json yet -- skipping dependency install"
  fi
}

post_create() {
  log "node    $(node --version)"
  log "pnpm    $(pnpm --version)  (store: $(pnpm store path 2>/dev/null || echo '?'))"
  log "gh      $(gh --version | head -1 | awk '{print $3}')"
  log "claude  $(claude --version 2>/dev/null || echo 'not on PATH')"

  if gh auth status >/dev/null 2>&1; then
    log "gh authenticated as $(gh api user --jq .login 2>/dev/null || echo '?')"
  else
    log "gh not authenticated -- run 'gh auth login' (host: use --insecure-storage)"
  fi
}

post_start() {
  claim_volumes
}

post_attach() {
  log "workspace $PWD -- vite will be on :5173 (bind 0.0.0.0)"
}

case "$STAGE" in
  on-create)      on_create ;;
  update-content) update_content ;;
  post-create)    post_create ;;
  post-start)     post_start ;;
  post-attach)    post_attach ;;
  *) echo "unknown stage: $STAGE" >&2; exit 64 ;;
esac
