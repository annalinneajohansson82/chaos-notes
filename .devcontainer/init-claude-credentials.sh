#!/usr/bin/env bash
set -e

CREDS=/home/node/.claude/.credentials.json

# Ensure .claude is owned by node (may be root-owned from bind-mount creation)
sudo -n chown node:node /home/node/.claude 2>/dev/null || true

# Bootstrap credentials from env var if not already present
if [ -n "$CLAUDE_CODE_OAUTH_TOKEN" ] && [ ! -f "$CREDS" ]; then
  printf '{"accessToken":"%s"}\n' "$CLAUDE_CODE_OAUTH_TOKEN" > "$CREDS"
  chmod 600 "$CREDS"
fi