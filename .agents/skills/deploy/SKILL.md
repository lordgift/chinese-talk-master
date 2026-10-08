---
name: deploy
description: >-
  Automates the deployment workflow for the project: 1. bumps the project version in package.json,
  2. merges the current git branch into main, and 3. pushes commits and tags to remote to trigger production deployment.
  Use this skill whenever the user asks to deploy, release, or push a new release to production.
---

# Deploy Skill

This skill automates the standard 3-step deployment and release workflow for Chinese Talk Master:
1. **Bump version** (`package.json` & `package-lock.json`)
2. **Merge git branch to main** (if working on a feature/fix branch)
3. **Push to remote** (`origin main` and version tag) to trigger Vercel deployment

## Quick Execution

You can run the bundled deploy script:

```bash
./.agents/skills/deploy/scripts/deploy.sh [patch|minor|major]
```

By default, it increments the patch version (e.g. `1.3.0` -> `1.3.1`). If a minor or major release is requested, pass `minor` or `major` as the argument.

---

## Detailed Step-by-Step Procedure

If executing commands step by step, follow this procedure:

### Step 1: Pre-check & Bump Version

1. Check current branch and git status:
   ```bash
   git status
   ```
   If there are uncommitted changes, commit them first:
   ```bash
   git add -A
   git commit -m "chore: save work before release"
   ```

2. Bump version using npm (default is `patch` unless specified):
   ```bash
   npm version patch --no-git-tag-version
   ```
   This updates `package.json` and `package-lock.json`.

3. Commit the version bump:
   ```bash
   NEW_VER=$(node -p "require('./package.json').version")
   git add package.json package-lock.json
   git commit -m "chore(release): bump version to v${NEW_VER}"
   ```

### Step 2: Merge Current Branch to Main

1. Check current branch:
   ```bash
   CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
   ```

2. If `CURRENT_BRANCH` is not `main`:
   ```bash
   git checkout main
   git pull origin main
   git merge "$CURRENT_BRANCH" -m "merge: merge $CURRENT_BRANCH into main for release v${NEW_VER}"
   ```

3. Create annotated git tag for release:
   ```bash
   git tag -a "v${NEW_VER}" -m "Release v${NEW_VER}" -f
   ```

### Step 3: Push to Remote

1. Push `main` branch to remote:
   ```bash
   git push origin main
   ```

2. Push the version tag to remote:
   ```bash
   git push origin "v${NEW_VER}"
   ```

3. **Verify Deployment**:
   - Vercel automatically detects the push to `origin/main` and triggers production build & deployment.
   - Verify production site health:
     ```bash
     curl -s -o /dev/null -w "%{http_code}\n" https://chinese-talk-master.vercel.app
     ```
   - Report the deployed version and production URL to the user.
