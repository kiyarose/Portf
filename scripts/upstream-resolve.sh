#!/usr/bin/env sh
# Run during a merge when package.json has conflict markers (npm cannot parse it).
set -e
cd "$(dirname "$0")/.."
exec node scripts/resolve-upstream-conflicts.mjs "$@"