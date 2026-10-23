# Content and assets

Update the owning content files, then review both languages locally using the [development workflow](getting-started.md).

## Site and event configuration

Edit [config.yaml](../../application/src/config.yaml) for site metadata, event details, CFP dates, feature flags, analytics and theme. Keep `site.site` and `site.base` consistent with [astro.config.ts](../../application/astro.config.ts).

Use timestamps with an explicit offset for `event.startsAt` and CFP dates, and an IANA timezone for `event.timeZone`. Keep `event.place.fr` and `event.place.en` aligned. Application code consumes event and CFP values through [event.ts](../../application/src/domains/event/config/event.ts).

`apps.program.isEnabled` controls programme and speaker pages. The generated schedule must match the configured event day; follow the [programme guide](program.md) when changing dates or sessions.

## Translations

French and English are defined in [i18n/config.ts](../../application/src/i18n/config.ts), with French as the default language. Use nested objects and matching structures in each locale file.

| Content                            | Owner under `application/src/`                           |
| ---------------------------------- | -------------------------------------------------------- |
| Navigation and footer labels       | `domains/navigation/{fr,en}.ts`                          |
| Shared metadata                    | `domains/metadata/{fr,en}.ts`                            |
| Sponsor showcase and dialog labels | `domains/event/sponsors/content/{fr,en}.ts`              |
| Page copy and page metadata        | `domains/pages/<page>/`, beside the owning page domain   |
| Practical information topics       | `domains/pages/practical-info/topics/<topic>/{fr,en}.ts` |
| Localized page slugs               | `i18n/routes.ts`                                         |

[i18n/utils.ts](../../application/src/i18n/utils.ts) composes shared dictionaries. For these dictionaries, `useTranslations(lang)` fills missing or empty values from French. Add shared keys to both locales.

## Blog posts

The blog and its list, post, category and tag routes are disabled in `apps.blog` in [config.yaml](../../application/src/config.yaml). To publish, enable the main flag and each required route flag, then rebuild.

Create one folder per post under [blog/content/posts](../../application/src/domains/pages/blog/content/posts):

```text
<post-id>/
  common.md
  fr.md
  en.md
```

Put shared frontmatter such as `publishDate`, `author`, `image` and `draft` in `common.md`. Put the localized `title`, `slug`, `excerpt`, `category`, `tags` and article body in each locale file. Frontmatter must be enclosed by `---` delimiters. Locale values override shared fields; article bodies come from the locale files.

The [collection schema](../../application/src/domains/pages/blog/content/post-collection.ts) defines available fields. A post needs a title to appear. Set an explicit publication date and use `draft: true` to exclude a post. Missing locale files produce no post in that language.

## Sponsors

The [sponsor registry](../../application/src/domains/event/sponsors/sponsors.ts) owns the displayed roster, tiers, URLs and pitches.

1. Add the logo to [sponsor assets](../../application/src/assets/images/sponsors) and import it into the registry.
2. Add a unique `id`, `name`, `url`, `tier`, `logo` and a `pitch` in both `fr` and `en`. Use a tier from `sponsorTiers`.
3. Set `showNameWithLogo` when a symbol-only logo needs the sponsor name beside it.
4. For a shared sponsorship, add `coSponsor` with its own `name`, `logo`, `url` and bilingual `pitch`. Both brands share one card and count as one sponsorship in the tier.

Pitches are plain text, with empty lines separating paragraphs. The dialog displays each participant's pitch and site link; expandable details provide the same information without JavaScript. Review the home and sponsoring pages in both languages after editing.

Keep source provenance and dated editorial evidence in [ADRs](../adr/README.md). The recorded Dell description sources are in [ADR 0003](../adr/0003-sponsor-content-sources.md).

## Icons

Place local SVG icons in [assets/icons](../../application/src/assets/icons). Icon loading and the included icon collections are configured in [astro.config.ts](../../application/astro.config.ts). Reuse the project's existing icons where possible.

## Accommodation photos and listings

Add property photos to [accommodation assets](../../application/src/assets/images/pages/practical-info/accommodation). Register the asset path, source page (`sourceHref`) and attribution (`credit`) in [stay-thumbnail.ts](../../application/src/domains/pages/practical-info/topics/accommodation/stay-thumbnail.ts).

Both [French](../../application/src/domains/pages/practical-info/topics/accommodation/fr.ts) and [English](../../application/src/domains/pages/practical-info/topics/accommodation/en.ts) listings use that registry. Update both listings together, keeping property details, filter IDs, site and map links consistent. Check the image and attribution in each language. Keep dated source research in ADRs.
