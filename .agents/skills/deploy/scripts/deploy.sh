#!/usr/bin/env bash
set -e

# Default bump type to patch if not provided (patch, minor, major)
BUMP_TYPE="${1:-patch}"

echo "🚀 Starting deploy workflow (bump type: $BUMP_TYPE)..."

CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
echo "📌 Current branch: $CURRENT_BRANCH"

# Check for uncommitted changes
if ! git diff-index --quiet HEAD --; then
  echo "⚠️ Working tree has uncommitted changes. Staging and committing..."
  git add -A
  git commit -m "chore: save work before deploy" || true
fi

# Step 1: Bump version
echo "📦 1. Bumping version ($BUMP_TYPE)..."
NEW_VERSION=$(npm version "$BUMP_TYPE" --no-git-tag-version)
echo "✅ Version bumped to $NEW_VERSION"

git add package.json package-lock.json
git commit -m "chore(release): bump version to $NEW_VERSION" || true

# Step 2: Merge to main (if not already on main)
if [ "$CURRENT_BRANCH" != "main" ]; then
  echo "🔀 2. Merging $CURRENT_BRANCH into main..."
  git checkout main
  git pull origin main || true
  git merge "$CURRENT_BRANCH" -m "merge: merge $CURRENT_BRANCH into main for release $NEW_VERSION"
else
  echo "ℹ️ Already on main branch. Skipping branch switch."
fi

# Create git tag for the new version
git tag -a "$NEW_VERSION" -m "Release $NEW_VERSION" -f

# Step 3: Push to remote
echo "📤 3. Pushing main and tags to remote..."
git push origin main
git push origin "$NEW_VERSION"

echo "🎉 Deployment pushed successfully! Vercel will automatically build and deploy $NEW_VERSION."
