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
- **Commits**: Conventional-commit-ish prefixes are used (`chore`, `ci`, `docs`, `fix`, `refactor`, `feat`, `build`). One logical change per commit keeps history easier to read and bisect.

## Reporting bugs and proposing changes

- Open an issue first for non-trivial changes so the design can be discussed before code is written.
- For typos, doc fixes, or one-line bugfixes, a direct PR is fine.
- Security issues: please follow [SECURITY.md](SECURITY.md) instead of filing a public issue.

## Releasing

(Maintainers only.) Tag a new release on `main`:

1. Make sure `package.json` `version` is bumped and `dist/` is rebuilt against the version on `main`.
2. Create an annotated tag (`git tag -a v2.x.y -m "..."`) and push it.
3. Move the floating major tag (`git tag -f v2 && git push -f origin v2`) so consumers pinned to `@v2` get the new release.
4. Publish a GitHub Release. Check the "Publish to the GitHub Marketplace" box on the first v2 release; subsequent releases inherit that listing.
