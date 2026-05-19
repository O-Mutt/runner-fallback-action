# Self-Hosted Runner Fallback Action

<p align="center">
  <a href="https://github.com/O-Mutt/runner-fallback-action/actions/workflows/ci.yml"><img alt="CI status" src="https://github.com/O-Mutt/runner-fallback-action/actions/workflows/ci.yml/badge.svg"></a>
  <a href="https://github.com/O-Mutt/runner-fallback-action/actions/workflows/codeql-analysis.yml"><img alt="CodeQL status" src="https://github.com/O-Mutt/runner-fallback-action/actions/workflows/codeql-analysis.yml/badge.svg"></a>
  <a href="https://github.com/marketplace/actions/self-hosted-runner-fallback"><img alt="Marketplace version" src="https://img.shields.io/github/v/release/O-Mutt/runner-fallback-action?label=Marketplace&logo=github&color=blue"></a>
  <a href="https://snyk.io/test/github/O-Mutt/runner-fallback-action"><img alt="Known vulnerabilities" src="https://img.shields.io/snyk/vulnerabilities/github/O-Mutt/runner-fallback-action"></a>
  <a href="https://github.com/O-Mutt/runner-fallback-action/commits/main"><img alt="Last commit" src="https://img.shields.io/github/last-commit/O-Mutt/runner-fallback-action?color=green"></a>
  <a href="LICENSE"><img alt="License: MIT" src="https://img.shields.io/badge/license-MIT-green"></a>
</p>

A GitHub Action that decides at run-time whether to use your self-hosted runners or fall back to a GitHub-hosted runner. It calls the GitHub Actions API, inspects the status of the runners that match a set of labels, and outputs the runner label set to use for the next job's `runs-on`.

Use it to:

- Keep CI green when self-hosted runners are offline, busy, or being rotated
- Burst onto GitHub-hosted runners when your self-hosted pool is saturated
- Avoid hard-coding `runs-on: ubuntu-latest` everywhere when you _sometimes_ have faster self-hosted hardware

## Prerequisites

Before this action will do anything useful you need:

1. **At least one self-hosted runner** registered to the repository, organization, or enterprise you want to query. Empty runner pools always resolve to the fallback runner.
2. **A token with admin permission** for that level — `GITHUB_TOKEN` does **not** have the scopes required to list runners. See [Permissions](#permissions) for the exact scope per level.
3. **The token stored as an Actions secret** (repository or organization). The workflow refers to it via `${{ secrets.<SECRET_NAME> }}`.

## Setup

A first-time setup, end to end:

1. **Create the token.**
   - For an organization: GitHub → your organization → _Settings → Developer settings → Personal access tokens → Tokens (classic) → Generate new token_, and select the `admin:org` scope.
   - For an enterprise: same flow at the enterprise level, with the `manage_runners:enterprise` scope.
   - For a single repository: a classic PAT with `repo` scope, or a fine-grained PAT with `Administration: Read` on that repo.
   - Copy the token immediately — GitHub will not show it again.
2. **Save the token as an Actions secret.**
   - Repository: _Settings → Secrets and variables → Actions → New repository secret._
   - Organization: _Org Settings → Secrets and variables → Actions → New organization secret._
   - Name it something like `RUNNER_API_TOKEN`. Note that **Actions** secrets are stored separately from **Dependabot** and **Codespaces** secrets.
3. **Decide your scope.** Add `organization:` or `enterprise:` to the action inputs if you want to query at that level. If you omit both, the action queries runners attached to the workflow's own repository.
4. **Add the action to your workflow.** Paste the [Quick start](#quick-start) snippet, replacing `primary-runner`, `fallback-runner`, and the secret name with your values.
5. **Consume the output.** Any downstream job that needs to run on the selected runner uses `runs-on: ${{ fromJson(needs.<job>.outputs.<output>) }}`. The `fromJson` wrapper is required — the action emits a JSON-encoded array so multi-label runners (`["self-hosted","linux"]`) round-trip safely.

## Quick start

```yaml
jobs:
  pick-runner:
    runs-on: ubuntu-latest
    outputs:
      runner: ${{ steps.choose.outputs.use-runner }}
    steps:
      - id: choose
        uses: O-Mutt/runner-fallback-action@v2
        with:
          primary-runner: 'self-hosted,linux'
          fallback-runner: 'ubuntu-latest'
          github-token: ${{ secrets.RUNNER_API_TOKEN }}

  build:
    needs: pick-runner
    runs-on: ${{ fromJson(needs.pick-runner.outputs.runner) }}
    steps:
      - run: echo "Running on ${{ needs.pick-runner.outputs.runner }}"
```

The output is a JSON-encoded array, which is why `fromJson(...)` is required when consuming it in `runs-on`.

## Inputs

### Required

| Name              | Description                                                                                                          |
| ----------------- | -------------------------------------------------------------------------------------------------------------------- |
| `github-token`    | Token that can list action runners for the chosen scope (repo, org, or enterprise). See [Permissions](#permissions). |
| `primary-runner`  | Comma-separated list of labels identifying your _primary_ runners (e.g. `self-hosted,linux`).                        |
| `fallback-runner` | Comma-separated list of labels for the runner to use if the primaries are unavailable (e.g. `ubuntu-latest`).        |

### Scope (mutually exclusive)

Choose exactly one of these to tell the action which runner pool to query. If neither is set, the action queries the runners attached to the current repository.

| Name           | Description                                             |
| -------------- | ------------------------------------------------------- |
| `organization` | GitHub organization name to query (e.g. `my-org`).      |
| `enterprise`   | GitHub enterprise slug to query (e.g. `my-enterprise`). |

### Optional

| Name                 | Default | Description                                                                                                                                                             |
| -------------------- | ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `primaries-required` | _unset_ | Minimum number of non-busy primary runners required before the primary is considered usable. If fewer than this many are free, the action returns the fallback runner.  |
| `fallback-on-error`  | `false` | When `true`, the action emits the fallback runner instead of failing if the API call errors (e.g. expired token, network blip). Recommended for non-critical workflows. |

## Outputs

| Name         | Description                                                                                                                                                  |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `use-runner` | A JSON-encoded array of labels. Parse it with `fromJson(...)` when assigning to `runs-on`. Example values: `["self-hosted","linux"]` or `["ubuntu-latest"]`. |

## Permissions

The GitHub Actions API endpoints for listing runners require an authenticated token with admin scope for the level you query. `GITHUB_TOKEN` does **not** have these permissions; you must supply a separate token.

| Scope          | Token type                 | Required permission                                                 |
| -------------- | -------------------------- | ------------------------------------------------------------------- |
| User repo      | Classic PAT / Fine-grained | `repo` (classic) or fine-grained `Administration: Read` on the repo |
| `organization` | Classic PAT                | `admin:org`                                                         |
| `enterprise`   | Classic PAT                | `manage_runners:enterprise`                                         |

Store the token in repository or organization secrets (e.g. `RUNNER_API_TOKEN`) and reference it via `secrets.RUNNER_API_TOKEN`. Note that Actions secrets and Dependabot secrets are separate stores.

## Full example

```yaml
jobs:
  # Decide once per workflow which runner the downstream jobs should use.
  determine-runner:
    runs-on: ubuntu-latest
    concurrency:
      # Serialize runner selection so primaries-required reflects accurate
      # capacity when several workflows are triggered by the same event.
      group: runner-determination
      cancel-in-progress: false
    outputs:
      runner: ${{ steps.set-runner.outputs.use-runner }}
    steps:
      - name: Wait for parallel workflow job startup
        # After we pick a runner, the consuming job has unavoidable startup
        # lag. Sleeping briefly lets the runner state stabilize before the
        # next workflow asks the same question.
        run: sleep 15

      - name: Pick a self-hosted runner if available, otherwise a public one
        id: set-runner
        uses: O-Mutt/runner-fallback-action@v2
        with:
          organization: 'ankidroid'
          # Labels a runner must match to be considered a primary.
          primary-runner: 'macos-selfhosted'
          # Label of the public/fallback runner.
          fallback-runner: 'macos-26'
          # Fall back if fewer than N primaries are free (optional).
          primaries-required: 1
          # Don't fail the workflow if the API call errors (optional).
          fallback-on-error: true
          github-token: ${{ secrets.RUNNER_API_TOKEN }}

  build:
    needs: determine-runner
    runs-on: ${{ fromJson(needs.determine-runner.outputs.runner) }}
    steps:
      - run: echo "Building on ${{ needs.determine-runner.outputs.runner }}"
```

Real-world references:

- [`ankidroid/Anki-Android-Backend` — build-release.yml](https://github.com/ankidroid/Anki-Android-Backend/blob/main/.github/workflows/build-release.yml)
- [`ankidroid/Anki-Android-Backend` — build-quick.yml](https://github.com/ankidroid/Anki-Android-Backend/blob/main/.github/workflows/build-quick.yml) (consumes the output in a dynamic matrix)

## Troubleshooting

| Symptom                                                         | Likely cause                                                                           | Fix                                                                                                                             |
| --------------------------------------------------------------- | -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `Input required and not supplied: github-token`                 | The referenced secret is empty or misspelled, or it lives in a different secret store. | Confirm the secret name. Remember Actions and Dependabot secrets are separate stores.                                           |
| `Failed to get runners. Status code: 401`                       | Token lacks the right scope for the level being queried.                               | Recreate the token with the scope shown in [Permissions](#permissions); make sure you used the level matching the action input. |
| `Failed to get runners. Status code: 404`                       | Wrong `organization` or `enterprise` slug, or the token cannot see that resource.      | Re-check spelling. For enterprise runners use the enterprise slug, not the display name. Verify the token owner has access.     |
| Job picks the fallback even though primaries appear online      | `primaries-required` is set higher than the number of non-busy primaries.              | Lower `primaries-required` or scale the primary pool. Drop the input entirely to accept any online primary (busy included).     |
| Downstream job fails with `runs-on: ${{ needs… }}` parse errors | Forgot the `fromJson(...)` wrapper, or the upstream job's output name is misspelled.   | Wrap the output: `runs-on: ${{ fromJson(needs.<job>.outputs.<name>) }}`. Verify the upstream job declared `outputs:` correctly. |
| Workflow occasionally picks the wrong runner under bursty load  | Multiple workflows asking the question in parallel race each other.                    | Serialize the selection job with a `concurrency:` block, as shown in the [Full example](#full-example).                         |

## Versioning

Releases follow [Semantic Versioning](https://semver.org/). Pin to a major version tag for automatic patch and minor updates:

```yaml
uses: O-Mutt/runner-fallback-action@v2
```

If you need byte-for-byte reproducibility, pin to a commit SHA:

```yaml
uses: O-Mutt/runner-fallback-action@<commit-sha>
```

| Major | Node runtime | Notes                                                                      |
| ----- | ------------ | -------------------------------------------------------------------------- |
| `v2`  | Node 24      | Current. Fixes the `primaries-required` busy-skip behavior bug.            |
| `v1`  | Node 20      | Initial release lineage inherited from `mikehardy/runner-fallback-action`. |

## Contributing

Issues and PRs are welcome at <https://github.com/O-Mutt/runner-fallback-action>.

Local development:

```bash
nvm use            # picks up .nvmrc (Node 24)
npm ci
npm run all        # lint, format:check, build dist/, test
```

The bundled `dist/` directory is checked in — the `check-dist` workflow will fail any PR that ships changes to `index.js` without a matching `npm run prepare` rebuild.

## License

[MIT](LICENSE)

## Credit

- The runner-availability pattern was originally described by [@ianpurton](https://github.com/ianpurton) in [this GitHub Community thread](https://github.com/orgs/community/discussions/20019#discussioncomment-5414593).
- The action was first written by [@jimmygchen](https://github.com/jimmygchen). [He archived his copy](https://github.com/jimmygchen/runner-fallback-action/pull/31#issuecomment-3454512133), and [@mikehardy](https://github.com/mikehardy) took over as the next maintainer.
- [@O-Mutt](https://github.com/o-mutt) contributed the [organization- and enterprise-level runner support](https://github.com/jimmygchen/runner-fallback-action/pull/28) and now maintains this fork.
