#!/usr/bin/env bash
set -euo pipefail

BRANCH="gh-pages"
FILES="index.html main.js crypto.js styles.css favicon.svg"

# Ensure we're in the repo root
cd "$(git rev-parse --show-toplevel)"

# Verify all files exist
for f in $FILES; do
  if [ ! -f "$f" ]; then
    echo "Missing file: $f"
    exit 1
  fi
done

# Create a temporary work directory
TMPDIR=$(mktemp -d)
trap 'rm -rf "$TMPDIR"' EXIT

# Copy static files
for f in $FILES; do
  cp "$f" "$TMPDIR/"
done

# Build the gh-pages commit
cd "$TMPDIR"
git init -q
git checkout -q -b "$BRANCH"
git add -A
git commit -q -m "Deploy to GitHub Pages"

# Push to the remote gh-pages branch
REMOTE=$(cd - > /dev/null && git remote get-url origin)
git push --force "$REMOTE" "$BRANCH"

echo "Deployed to $BRANCH"
