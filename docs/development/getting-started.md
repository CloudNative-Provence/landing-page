# Development

Read the [documentation rules](documentation.md) before contributing.
Run the commands below from the repository root.

## Setup

Install Node.js and npm matching the [application engines](../../application/package.json).
The development version selector is [`.node-version`](../../application/.node-version).
GNU Make runs the project targets; Bash and `tee` are needed for CI lint output,
and Docker is needed for repository-wide linting.

```bash
make setup
make start
```

Open `http://localhost:4321`. To use the configured container, open the repository
in Visual Studio Code, run "Dev Containers: Reopen in Container", then run the same
commands. The [Dev Container configuration](../../.devcontainer/devcontainer.json)
provides Node.js, Docker, GitHub CLI, editor extensions, and port forwarding.

## Commands

| Command                                   | Result                                                                  |
| ----------------------------------------- | ----------------------------------------------------------------------- |
| `make help`                               | Lists the available targets.                                            |
| `make build`                              | Generates the static site in `application/dist/`.                       |
| `npm --prefix application run preview`    | Serves the generated build locally.                                     |
| `make test`                               | Runs importer tests and application tests with coverage and CI reports. |
| `npm --prefix application run test:watch` | Watches application tests.                                              |
| `npm --prefix application run lint`       | Runs Astro checks and Biome without fixers.                             |
| `make lint`                               | Runs application checks and the Docker-based repository linter.         |
| `make lint-fix`                           | Applies application and repository lint fixes.                          |

The [Makefile](../../Makefile) and [npm scripts](../../application/package.json)
define the commands. `make ci` runs dependency maintenance (`npm audit fix` and a
Browserslist database update), lint fixers, build, and tests; it can modify files.
Use the individual check commands when you need validation without fixers.

Markdown formatting belongs to the repository's Prettier check; Biome formats
application code. CI lint commands stream diagnostics to the terminal, preserve
Astro text and Biome SARIF reports, and return a failure status when a check fails.

## Validate changes

- Documentation: check Markdown, local links, and heading anchors; compare commands
  and behavior claims with source. See the [documentation checklist](documentation.md).
- Application behavior: run the relevant colocated tests first, then `make test`
  and `npm --prefix application run lint` as needed for the affected scope.
- Importer: run `npm --prefix application run test:schedule` without an API key.
- Routes, content, or configuration: run `make build` to check static generation.
- UI: review both languages, narrow and wide viewports, keyboard use, and applicable
  fallback behavior in the browser.

Application tests use [Vitest configuration](../../application/vitest.config.ts);
importer tests use Node's test runner. Report only checks actually run.
For simulated event times, see the [development clock](program.md#preview-an-event-time).
