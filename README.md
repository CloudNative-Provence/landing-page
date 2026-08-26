# Cloud Native Provence - Landing Page

Conference site for Cloud Native Provence, with bilingual routing (`fr` / `en`) and translated page slugs.

## Development workflow

Use `make` commands from the repository root.

```bash
make help
```

Main targets:

- `make setup` - install project dependencies
- `make start` - start local dev server (`application`)
- `make build` - production build
- `make test` - run application tests with coverage
- `make lint` - run linters/checks
- `make lint-fix` - run fixers
- `make ci` - lint + build + test pipeline

## Tests and coverage

Tests run with Vitest from `application/`.

```bash
make test
```

## Dev Container

This repository includes a Visual Studio Code Dev Container in `.devcontainer/devcontainer.json`.

Quick start:

1. Open the repository in Visual Studio Code.
2. Run `Dev Containers: Reopen in Container`.
3. Inside the container:

```bash
make setup
make start
```

The dev container provides:

- Node.js 22
- Docker-in-Docker
- GitHub CLI
- Visual Studio Code extensions for Astro, Biome, Tailwind, Makefile, Copilot

The app is available on port `4321`.

## Routing model

Routing is locale-first and centralized:

- `/` redirects to `/fr`
- `/fr` and `/en` are localized homepages
- `/{lang}/{translated-slug}` serves localized content pages
- `/{lang}/blog/...` serves localized blog list, posts, categories, and tags

Key files:

- `application/astro.config.ts` - root redirect configuration
- `application/src/pages/[lang]/index.astro` - localized homepage
- `application/src/pages/[lang]/[page].astro` - localized dynamic pages
- `application/src/i18n/routes.ts` - slug mapping and path translation helpers

## Program schedule URL parameters

The program page (`/{lang}/programme` in `fr`, `/{lang}/program` in `en`) reads query parameters to preload a view. They can be combined.

| Parameter    | Values | Effect                                                                                                                           |
| ------------ | ------ | -------------------------------------------------------------------------------------------------------------------------------- |
| `agenda`     | token  | Preselects saved sessions. Encoded as a compact, order-stable token (see below); legacy comma-separated ID lists still parse.    |
| `live`       | `true` | Enables the live view: dims past sessions and highlights the current one, auto-refreshing over time.                             |
| `fullscreen` | `true` | Opens the presentation (kiosk/TV) layout: hides the filters and agenda panels, shows a top bar with clock, and fills the screen. |

Notes:

- **Agenda token** — produced by `ProgramSelectionCodec.encode()`; it compresses the session IDs so the URL stays short regardless of how many sessions are saved, and stays valid even if the schedule order changes. `share` links use this token; `localStorage` keeps the plain ID list for durability.
- **Fullscreen flag** — because the [Fullscreen API](https://developer.mozilla.org/en-US/docs/Web/API/Fullscreen_API) requires a user gesture, the flag applies the presentation layout immediately (ideal when the browser is already in OS-level/kiosk fullscreen on a TV) and upgrades to real browser fullscreen on the first tap/keypress. Exit with `Esc` or the top-bar button; both strip the `fullscreen` flag from the URL.
- Example wall display: `/{lang}/programme?fullscreen=true&live=true`.

Key files:

- `application/src/domains/pages/program/components/program-schedule-element.ts` - client behavior (selection, live view, fullscreen/presentation mode)
- `application/src/domains/pages/program/services/selection-codec.ts` - agenda token encode/decode
- `application/src/domains/pages/program/services/live-view.ts` - `live` param + live-state classification
- `application/src/domains/pages/program/services/fullscreen-view.ts` - `fullscreen` param helper

## Translations

Translations are split by **domain** and **locale** (`en.ts`, `fr.ts`) using nested objects (no dot-string keys in data files).

- Shared site copy lives in `application/src/domains/`:
  - `navigation/` for header and footer labels
  - `metadata/` for site-wide metadata copy
- Page-specific content lives in domain-owned folders:
  - `application/src/domains/pages/<page>/`
  - `application/src/domains/pages/program/content/`
  - `application/src/domains/pages/practical-info/content/`
  - `application/src/domains/pages/blog/content/posts/`

Runtime behavior:

- Supported languages and default locale are defined in `application/src/i18n/config.ts`.
- Shared translation dictionaries are composed in `application/src/i18n/utils.ts` (`sourceLocales`).
- `useTranslations(lang)` returns a locale object merged with fallback values from the default language (`fr`) when a value is missing or empty.

When adding or changing translations:

1. Put the value in the correct domain (or page file if page-local).
2. Keep `navigation` as the single source of truth for shared navigation/footer labels.
3. Keep `en` and `fr` structures aligned.

## Project structure

All application source code lives under `application/src`. The source-tree guide for humans and coding agents is in this section.

```text
/
├── .devcontainer/
├── .github/
├── Makefile
├── Dockerfile
├── README.md
└── application/
    ├── astro.config.ts
    ├── package.json
    ├── public/
    │   ├── _headers
    │   ├── robots.txt
    │   └── logos/
    ├── src/
    │   ├── assets/
    │   ├── domains/
    │   │   ├── event/
    │   │   ├── metadata/
    │   │   ├── navigation/
    │   │   └── pages/
    │   │       ├── routing/
    │   │       ├── about/
    │   │       ├── blog/
    │   │       ├── practical-info/
    │   │       ├── program/
    │   │       └── ...
    │   ├── i18n/
    │   ├── layouts/
    │   │   ├── composition/
    │   ├── pages/
    │   │   ├── [lang]/
    │   │   ├── about/
    │   │   ├── brand-guidelines/
    │   │   ├── contact/
    │   │   ├── home/
    │   │   ├── privacy/
    │   │   ├── sponsoring/
    │   │   ├── terms/
    │   │   ├── 404.astro
    │   │   ├── index.astro
    │   │   └── rss.xml.ts
    │   ├── shared/
    │   │   ├── components/
    │   │   ├── content/
    │   │   ├── formatting/
    │   │   ├── media/
    │   │   ├── url/
    │   │   └── strings/
    │   └── test/
    │       ├── contracts/
    │       └── mocks/
    └── vendor/
```

## Source Organization

All application source code lives under `application/src`. If you are adding or moving code, choose the narrowest top-level folder that owns the behavior.

### Placement rules

- Keep route files and route-only composition in `pages/`.
- Keep business logic and business content in `domains/` under the owning domain.
- Keep cross-domain primitives in `shared/`.
- Keep reusable shared presentation in `shared/components/` and page shells in `layouts/`.
- Keep locale, slug, and translation mechanics in `i18n/`.
- Keep shared test fixtures and mocks in `test/`.
- Keep imported static assets in `assets/`.
- Keep only framework-owned root files such as `config.yaml`, `content.config.ts`, `env.d.ts`, and `types.d.ts` directly under `src/`.

### Read the layers correctly

- `pages/` owns Astro route entrypoints only. Files there should translate URL params, choose layouts, and delegate.
- `domains/pages/<page>/` owns page-domain content and page-domain logic. This is where localized page data, blog content, program models, and practical-info section registries belong.
- `domains/pages/routing/` owns page-routing support such as page registries and page feature flags.
- `shared/components/` owns reusable shared rendering only. Page-owned UI now lives with the owning page domain under `domains/pages/<page>/components/`.
- `layouts/` owns page shells and layout composition. `layouts/composition/` is the home for layout-only data shaping such as header and footer composition.
- `shared/` owns generic non-domain helpers such as Markdown pipeline plugins, URL helpers, string helpers, and media helpers.

### Root folders

| Entry      | Goal                                     | Put / find here                                                                                                                                                                   | Keep out                                                                      |
| ---------- | ---------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| `assets/`  | Bundled static assets used by the app    | Favicons, images, and styles imported from Astro or TypeScript modules                                                                                                            | Public files that must be served as-is; those belong in `application/public/` |
| `domains/` | Domain ownership                         | Shared site metadata/navigation plus page-owned domains grouped under `pages/`, including page routing rules under `pages/routing/`, with separate non-page domains like `event/` | Generic cross-domain helpers with no clear owner; those belong in `shared/`   |
| `i18n/`    | Localization and localized routing rules | Locale config, translated slug maps, translation assembly, and related tests                                                                                                      | Page-specific copy or UI components                                           |
| `layouts/` | Page shells and layout composition       | Top-level Astro layouts and layout-only composition helpers such as header/footer shaping                                                                                         | Domain business logic or reusable cross-page UI                               |
| `pages/`   | URL ownership                            | Astro route entrypoints, route handlers, and route-owned files that map to URLs                                                                                                   | Shared helpers, domain utilities, or unit tests not meant to be routable      |
| `shared/`  | Cross-domain primitives and shared UI    | Shared components, content pipeline helpers, formatting, media, URL, string, and other helpers that stay domain-agnostic                                                          | Business rules that mention a specific domain such as blog, event, or program |
| `test/`    | Shared test support                      | Reusable mocks, fixtures, and test-only helpers imported by multiple specs                                                                                                        | Production code                                                               |

### Similar names, different roles

- `layouts/composition/` composes header and footer structures for the Astro layouts. `domains/navigation/` stores localized navigation copy only.
- `shared/content/` contains Markdown and Astro content pipeline helpers. `domains/pages/*/content/` contains business content owned by a specific page domain.
- `domains/pages/routing/` contains page-routing support. `pages/` contains framework route entrypoints only.
- `domains/pages/*/components/` owns page-specific UI. `shared/components/` is reserved for truly shared UI used across domains.
- `domains/metadata/` contains shared metadata copy. Page-specific metadata belongs in the owning page domain, not in `domains/metadata/`.
- `shared/url/` contains generic permalink and URL helpers. If a helper knows about page enablement or page registry rules, it belongs in `domains/pages/routing/` instead.
- `shared/content/` contains generic Markdown and content-pipeline helpers. If a helper becomes layout-specific, move it into `layouts/composition/`.

### Naming conventions inside `domains/` and `shared/`

- `domains/pages/<page>/`: use this for page-owned domains such as `about`, `blog`, `program`, `practical-info`, `privacy`, or `terms`.
- `domains/pages/routing/`: use this for page-routing support that coordinates page domains without becoming a framework route file.
- Inside a domain, prefer role folders such as `content/`, `config/`, `model/`, `sections/`, or `services/` only when they earn their keep.
- `domains/pages/blog/content/posts/`: keep one folder per post identity with `common.md`, `en.md`, and `fr.md`.
- `domains/metadata/` is for localized metadata copy. `domains/event/config/event.ts` is the only shared entrypoint for event and CFP values derived from `config.yaml`.
- Cross-page contract tests belong in `test/contracts/`, for example `page-content.contract.test.ts`.
- `shared/` is only for code that stays domain-agnostic. If a helper starts knowing about blog, event, program, or practical info, move it back into that domain.
- `shared/components/` is the home for truly shared UI used across pages and domains.
- `shared/content/` is the home for generic Markdown and content-pipeline helpers.
- `shared/url/` is the home for generic permalink and URL helpers.
- Avoid catch-all names like `utils.ts`, `helpers.ts`, `misc.ts`, `data.ts`, or `post.ts` for new files unless that file is the actual owning module for the whole area.

### Root files

These root files still define ownership boundaries inside `src`:

- `config.yaml`: canonical site, event, app-feature, and metadata configuration.
- `content.config.ts`: Astro-required root entrypoint for content collections. Keep the file at `src/`, but delegate blog collection definitions to `domains/pages/blog/content/`.
- `env.d.ts` and `types.d.ts`: ambient type declarations.

Everything else should live under `domains/`, `shared/`, `pages/`, `layouts/`, `i18n/`, or `test/`.

### How to place new code

- New route or endpoint: add it to `pages/`.
- New page-routing support such as page registries or page feature flags: add it to `domains/pages/routing/`.
- New layout-only composition helper: add it to `layouts/composition/`.
- New reusable cross-domain UI fragment: add it to `shared/components/`.
- New page-owned UI fragment: add it to `domains/pages/<page>/components/`.
- New layout or page shell: add it to `layouts/`.
- New domain logic or domain-owned content: add it to the owning area under `domains/`.
- New shared site metadata copy: add it to `domains/metadata/`.
- New event-derived values or CFP state: add it to `domains/event/` and expose config-backed values through `domains/event/config/event.ts`.
- New page-owned domain content such as blog, program, or practical info: add it under `domains/pages/<page>/`.
- New blog post content: add it to `domains/pages/blog/content/posts/<post-id>/` with `common.md` plus one file per locale.
- New locale or slug logic: add it to `i18n/`.
- New Markdown or content-pipeline helper: add it to `shared/content/`.
- New generic permalink or URL helper: add it to `shared/url/`.
- New cross-domain helper with tests: add it to `shared/`, only if no single domain owns it, and colocate its unit test when practical.
- New cross-page contract test: add it to `test/contracts/` with a contract-oriented name.
- New shared fixture or mock for tests: add it to `test/`.
- New route-level regression test: colocate it with the route owner, usually in `pages/`.

### Guardrails

- Prefer colocated tests with the module or route they cover, and use `test/` only for shared test support.
- Keep `pages/` thin; route modules should adapt URL params and delegate to `domains/`, `layouts/`, or `shared/`.
- Do not move support code into `pages/`; Astro treats every file there as part of the routing surface.
- Do not place helpers in `pages/`; Astro treats files there as part of the routing surface.
- Do not bypass `domains/event/config/event.ts` when exposing event and CFP values from `config.yaml`.
- Do not put page-owned copy in `domains/metadata/` or `domains/navigation/`; keep shared copy there and move page-specific copy back to the owning page domain.
- Do not put page-owned UI back into `shared/components/`; colocate it inside the owning page domain.
- `shared/` must not depend on `pages/`, and it should stay free of domain-specific knowledge.
- Do not introduce new generic buckets like `data/` or `utils/`; choose the owning domain and name files for the behavior they provide.
- If a folder starts collecting more than one kind of responsibility, split by domain before adding more files.

## CI

GitHub Actions CI runs from the `application/` directory and builds the static site output in `application/dist`.
