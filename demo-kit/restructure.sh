#!/usr/bin/env bash
# Backup for Lecture 2's restructure prompt. Moves an app project into the full-stack layout:
#
#   project/
#   ├── .claude/     (the app's .claude + supabase/.claude, merged)
#   ├── .mcp.json    (moved up from supabase/)
#   ├── front-end/   (everything else that was in the project root)
#   ├── supabase/
#   ├── CLAUDE.md
#   └── README.md
#
# Usage:   bash restructure.sh ~/demos/ticked
set -euo pipefail

ROOT="${1:?usage: bash restructure.sh <project-folder>}"
cd "$ROOT"
test -d supabase || { echo "No supabase/ folder in $ROOT. Is this the right project?"; exit 1; }
test -e front-end && { echo "front-end/ already exists. Already restructured?"; exit 1; }

mkdir front-end
shopt -s dotglob nullglob
for f in *; do
  case "$f" in
    .claude|.git|.mcp.json|supabase|front-end|CLAUDE.md|README.md) ;;   # these stay in the root
    *) mv "$f" front-end/ ;;
  esac
done

# One shared .claude: copy in the database's skills and agents (never overwrite), then remove the old one
if [ -d supabase/.claude ]; then
  mkdir -p .claude
  cp -Rn supabase/.claude/. .claude/
  rm -rf supabase/.claude
fi

# The Supabase MCP config moves to the root, where the main Claude session runs
if [ -f supabase/.mcp.json ]; then mv supabase/.mcp.json .mcp.json; fi

echo "Done:"
ls -A
echo
echo "Next: update CLAUDE.md (or ask Claude to), then restart claude here and check /mcp and /agents."
