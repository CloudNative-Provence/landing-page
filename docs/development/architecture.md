# Source ownership and routing

The static Astro application lives in [`application/`](../../application/).
Choose the narrowest owner for each change.

## Source layout

All paths in this table are relative to `application/src/`.

| Path                     | Owns                                                             |
| ------------------------ | ---------------------------------------------------------------- |
| `pages/`                 | URL entrypoints, endpoint handlers, and route-only composition.  |
| `domains/pages/<page>/`  | Page content, business logic, and page-specific components.      |
| `domains/pages/routing/` | Localized page registry and publishing flags.                    |
| `domains/event/`         | Shared event configuration and sponsor data and components.      |
| `domains/navigation/`    | Shared navigation labels.                                        |
| `domains/metadata/`      | Site-wide metadata copy.                                         |
| `layouts/`               | Page shells and layout composition.                              |
| `shared/`                | Cross-domain primitives and shared components.                   |
| `i18n/`                  | Locale configuration, slug translation, and dictionary assembly. |
| `assets/`                | Bundled images, icons, and styles.                               |
| `test/`                  | Shared test support and cross-page contract tests.               |

Files served unchanged belong in [`application/public/`](../../application/public/).
Keep `config.yaml`, `content.config.ts`, `env.d.ts`, and `types.d.ts` at the source
root. `content.config.ts` delegates collection definitions to the blog domain.

## Placement rules

- Keep route entrypoints thin: resolve URL parameters, choose a layout, and delegate.
  Astro treats files under `pages/` as routing inputs; route composition uses
  underscore-prefixed files such as `_content.astro`.
- Keep page-specific UI beside its page domain. Reusable UI belongs in
  `shared/components/`; sponsor UI shared by home and sponsoring belongs in
  `domains/event/sponsors/components/`.
- Put header/footer composition in `layouts/composition/` and shared labels in
  `domains/navigation/`. Page metadata and page copy stay with their page.
- Expose event and CFP values from `config.yaml` through
  [`domains/event/config/event.ts`](../../application/src/domains/event/config/event.ts).
- Keep `shared/` free of domain rules and dependencies on `pages/`. Generic Markdown
  helpers belong in `shared/content/`; generic URL helpers belong in `shared/url/`.
  Page enablement belongs in the routing domain.
- Name modules for their behavior. Add role folders such as `content/`, `model/`, or
  `services/` when useful; avoid catch-all `utils/` and `data/` directories.
- Colocate unit tests with their owner. Put cross-page contracts in `test/contracts/`
  and shared mocks in `test/mocks/`. Route test filenames use the underscore prefix
  to keep them out of the routing surface.

## Localized routes

[`astro.config.ts`](../../application/astro.config.ts) redirects `/` to `/fr`.
Homepages use `/fr` and `/en`; content pages use `/{lang}/{translated-slug}`.
Practical information uses a further translated topic segment.

[`i18n/routes.ts`](../../application/src/i18n/routes.ts) owns page and topic slug maps.
[`localized-page-registry.ts`](../../application/src/domains/pages/routing/localized-page-registry.ts)
connects page domains to their composition and layout.
[`page-flags.ts`](../../application/src/domains/pages/routing/page-flags.ts) controls
published programme and speaker routes. Blog routes follow their flags in
[`config.yaml`](../../application/src/config.yaml).

When adding a page, update its domain, slug map, registry, route composition, and
relevant localized navigation. Keep both locales aligned; see [content editing](content.md).

## Time-dependent navigation

[`site-navigation.ts`](../../application/src/layouts/composition/site-navigation.ts)
composes Event, Practical Information, and Organization sections. The header
promotes Programme when published, plus Sponsoring on other days or Venue map on
the event day. The browser checks the configured event date in `event.timeZone`
at minute boundaries, so an open page can switch without a rebuild.

See [programme](program.md) and [venue map](venue-map.md) for domain contracts.
