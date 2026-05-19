# Contributing

Thanks for considering a contribution!

## Quick start

```bash
nvm use            # picks up Node 24 from .nvmrc
npm ci
npm run all        # lint + format:check + build dist/ + test
```

`npm run all` is what CI runs. If it passes locally, it should pass in the pipeline.

## Conventions

- **Source of truth for Node version**: `.nvmrc`. The workflows read from it; do not hardcode Node versions.
- **Bundled `dist/` is committed**. GitHub Actions executes `dist/index.js` directly, so any change to `index.js` must be accompanied by a fresh `npm run prepare`. The `check-dist` job will fail any PR that doesn't ship the rebuild.
- **Style**: Prettier (`.prettierrc.json`) + ESLint (`eslint.config.mjs`). Run `npm run format` to fix style and `npm run lint` to catch logic issues.
- **Tests**: Jest (`index.test.js`). New behavior should come with a matching unit test.
- **Commits**: [Conventional Commits](https://www.conventionalcommits.org/) prefixes are required because release-please uses them to decide the next version. Use `feat:` (minor), `fix:`/`perf:`/`refactor:` (patch), `feat!:` or a `BREAKING CHANGE:` footer (major), and `docs:`/`build:`/`ci:`/`chore:` (no release). One logical change per commit keeps history easier to read and bisect.

## Reporting bugs and proposing changes

- Open an issue first for non-trivial changes so the design can be discussed before code is written.
- For typos, doc fixes, or one-line bugfixes, a direct PR is fine.
- Security issues: please follow [SECURITY.md](SECURITY.md) instead of filing a public issue.

## Releasing

Releases are automated by [release-please](https://github.com/googleapis/release-please-action). Maintainers do not tag or write release notes by hand.

1. Land Conventional Commit PRs to `main`. release-please reads the commit history to decide the next version (`feat` → minor, `fix`/`perf`/`refactor` → patch, anything with `!` or a `BREAKING CHANGE:` footer → major).
2. On every push to `main`, the `release-please` workflow opens or updates a **"chore(main): release X.Y.Z"** PR containing the generated `CHANGELOG.md` and a matching `package.json` version bump.
3. Maintainers review the release PR. If `index.js` changed since the last release, confirm `dist/` was rebuilt (the `check-dist` job will catch a stale build).
4. Merging the release PR triggers release-please to:
   - create the immutable `vX.Y.Z` git tag and the GitHub Release with the changelog as the release notes
   - move the floating major tag (`v2`) so Marketplace consumers pinned to `@v2` get the new release automatically
5. **First v2 release only**: on the GitHub Release UI, tick **"Publish this release to the GitHub Marketplace"**. Subsequent releases inherit the listing.

### One-time setup

The `.release-please-config.json` and `.release-please-manifest.json` files capture the release state and configuration. If the manifest version drifts from reality (e.g. after a manual tag), edit the manifest to match the last real release and merge — release-please will pick up from there.
