# ADR 0004: Shared CI and local validation

- Status: Accepted
- Date: 2026-11-23

## Context

The repository used older Hoverkraft reusable workflows. Application checks ran
in CI, while repository linting was available only through Make. Local `make ci`
also ran dependency updates and fixers, so checking a change could alter its
source or lockfile. The Dev Container selected Node.js 22 while CI selected LTS.

## Decision

Use the current stable Hoverkraft workflows, pinned to release commits. Add the
shared repository linter and consolidated reports to the common CI entrypoint.
Keep Node.js build, test, and GitHub Pages artifact contracts. Configure test
report grouping for nested workflows, require JUnit and LCOV artifacts, and
disable PR comment writes for fork and Dependabot pull requests.

Use the same digest-pinned linter image locally and in CI. Align the container
with the existing Node.js LTS selector. Install from the lockfile with lifecycle
scripts disabled. Keep validation separate from explicit formatting and
dependency-maintenance targets, and fail on unknown Make targets.

Restrict automated schedule commits to the generated schedule file. Preserve
the existing merge policy rather than changing repository settings as part of
the dependency migration.

## Alternatives

- Updating only action references would leave repository checks outside CI and
  retain surprising local mutations.
- Writing custom lint and reporting workflows would duplicate maintained
  upstream behavior.
- Adding test sharding is unnecessary without evidence that test duration
  warrants the additional jobs and report-merging complexity.

## Consequences

Repository linting becomes a deployment gate. The calling workflows must pass
the permissions required by the nested linter jobs. Reports run after failed
checks, while deployment still requires successful CI. Missing requested test
reports are failures under the new shared reporting contract.

Contributors run dependency maintenance explicitly and review the resulting
diffs. GitHub-hosted runners provide the native `$/` references and Node.js action
runtimes required upstream. This migration does not add a documentation generator
or alter repository merge settings.

## Upstream evidence

Release metadata and workflow source were checked on 2026-11-23. This table is
historical migration evidence; maintained pins remain in the workflow YAML.

| Dependency            | Previous          | Selected stable release                                                          | Relevant compatibility                                                                                                                                                                     |
| --------------------- | ----------------- | -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Hoverkraft Common     | 0.38.0            | [4.3.1](https://github.com/hoverkraft-tech/ci-github-common/releases/tag/4.3.1)  | Native `$/` references require runner 2.336.0 or newer. Quality actions moved under `actions/quality`; semantic title lint needs only `contents: read`. Requested report files must exist. |
| Hoverkraft Node.js CI | 0.24.4            | [3.1.0](https://github.com/hoverkraft-tech/ci-github-nodejs/releases/tag/3.1.0)  | Installation skips lifecycle scripts by default. Nested reports accept a calling job group. Removed package/release APIs are not used here.                                                |
| Hoverkraft Publish    | 0.29.0            | [3.1.0](https://github.com/hoverkraft-tech/ci-github-publish/releases/tag/3.1.0) | GitHub Pages inputs and the full-path build artifact contract remain supported. Release-planning changes do not affect this caller.                                                        |
| GitHub App token      | v3.2.0            | [v3.4.0](https://github.com/actions/create-github-app-token/releases/tag/v3.4.0) | Existing client ID, private key, repository scope, and permission inputs remain supported.                                                                                                 |
| Checkout              | v7.0.1            | [v7.0.1](https://github.com/actions/checkout/releases/tag/v7.0.1)                | Already current.                                                                                                                                                                           |
| GitHub Script         | v9.0.0 tag object | [v9.0.0](https://github.com/actions/github-script/releases/tag/v9.0.0)           | Pin the tag's resolved commit. Existing dynamic imports and injected `core` and `io` remain supported on its Node.js 24 runtime.                                                           |

The [released linter source](https://github.com/hoverkraft-tech/ci-github-common/blob/f165c0ca3e88604611481e1408ace1e0e3a5ee47/.github/workflows/linter.yml)
pins Super-Linter 2.0.2 to the same digest used locally. The
[shared CI example](https://github.com/hoverkraft-tech/ci-github-common/blob/f165c0ca3e88604611481e1408ace1e0e3a5ee47/.github/workflows/__shared-ci.yml)
demonstrates separate lint and consolidated reporting jobs.
