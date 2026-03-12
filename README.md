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
- Visual Studio Code extensions for Astro, ESLint, Prettier, Tailwind, Makefile, Copilot

The app is available on port `4321`.

## Routing model

Routing is locale-first and centralized:

- `/` redirects to `/fr`
- `/fr` and `/en` are localized homepages
- `/{lang}/{translated-slug}` serves localized content pages
- `/{lang}/blog/...` serves localized blog list, posts, categories, and tags

Key files:

- `application/src/pages/index.astro` - root redirect
- `application/src/pages/[lang]/index.astro` - localized homepage
- `application/src/pages/[lang]/[page].astro` - localized dynamic pages
- `application/src/i18n/routes.ts` - slug mapping and path translation helpers

## Translations

Translations are split by **domain** and **locale** (`en.ts`, `fr.ts`) using nested objects (no dot-string keys in data files).

- Shared UI domains live in `application/src/data/`:
  - `navigation/` (header + footer labels)
  - `meta/`
- Page-specific content/labels live in `application/src/data/pages/<page>/{en,fr}.ts` and should be consumed only by their related page(s) in `application/src/pages/`.

Runtime behavior:

- Supported languages and default locale are defined in `application/src/i18n/config.ts`.
- Shared translation dictionaries are composed in `application/src/i18n/utils.ts` (`sourceLocales`).
- `useTranslations(lang)` returns a locale object merged with fallback values from the default language (`fr`) when a value is missing or empty.

When adding or changing translations:

1. Put the value in the correct domain (or page file if page-local).
2. Keep `navigation` as the single source of truth for shared navigation/footer labels.
3. Keep `en` and `fr` structures aligned.

## Project structure

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
    │   ├── components/
    │   ├── content/
    │   ├── data/
    │   ├── i18n/
    │   ├── layouts/
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
    │   └── utils/
    └── vendor/
```

## Configuration and build

- Site and app settings: `application/src/config.yaml`
- Astro configuration and integrations: `application/astro.config.ts`
- Static build output: `application/dist/`

## CI

GitHub Actions CI runs from the `application/` directory and builds the static site output in `application/dist`.
