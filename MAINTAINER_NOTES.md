# MAINTAINER_NOTES.md

## Release Workflow

To bump version, update changelog, tag, and push:

Run one of the following based on the type of release:

```bash
npm run release:patch   # For bug fixes or small changes
npm run release:minor   # For new features (backward compatible)
npm run release:major   # For breaking changes
```

Each command will:

- Bump the version in package.json
- Update `CHANGELOG.md`
- Commit the changes
- Tag the release (e.g., `v1.1.0`)
- Push the code and tag to GitHub

## Publishing

Publishing is automatic on `master` push if a version has been bumped:

- Runs `npm run build`, `npm test`
- `npm run release:minor` or `npm run release:major` Publishes to npm
- Creates a GitHub release with a tag

# Tokens and Auth

- `NPM_TOKEN`: Added under GitHub → Settings → Secrets → Actions
- `GITHUB_TOKEN`: Provided by GitHub automatically

## Required Files

Make sure the following are always up to date:

- `package.json` with correct `"main"`, `"types"`, `"files"` fields
- `lib/` contains compiled files
- `README.md` is clean and accurate

## Testing

Run tests before releasing:

```
npm test
```

Tests are required for GitHub Actions to publish.

## Cleanup

Don't commit `src/` if it’s not needed in the published package

Don’t publish `MAINTAINER_NOTES.md`, `.vscode/`, or test files

This is handled by the `"files"` field

---

Let me know if you want to:

- Add commit message guidelines (e.g., Conventional Commits)
- Generate changelogs based on commit messages
- Auto-publish **only on new tags**, not every push to `main`
