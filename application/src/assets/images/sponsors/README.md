# Sponsor assets

Only sponsors in the supplied 2026 roster are displayed. Tier assignments and site links live in `domains/event/sponsors/sponsors.ts`.

Cards stay compact with a single action: “Découvrir [sponsor]” / “Discover [sponsor]” opens the complete localized pitch in a native dialog, which includes the sponsor’s site link. Every sponsor must have a pitch in French and English; the `Sponsor` type requires both. Without JavaScript, pitches and site links remain available in expandable details.

The supplied `sponsors-assets-20260921T143210Z-1-001.zip` is the source of the BlackSwift, DoNow, Gravitek, Hoverkraft, Kraftr and Smart Tribune logos. SVG artwork is preserved.

Raster files are trimmed to their artwork, resized for web display and converted to WebP (including CMYK-to-sRGB conversion for Smart Tribune). Brand colors and proportions are preserved; light logo panels ensure legibility in either theme.

The three logos absent from the archive were retrieved from official sites on 2026-09-21:

- Exoscale: <https://www.exoscale.com/static/img/logo-exoscale-white-201711.svg>
- CNCF: <https://www.cncf.io/wp-content/uploads/2023/04/cncf-main-site-logo.svg>
- IKKI League: <https://www.ikki-league.com/static/image/logoTextDark.svg>

Sponsor descriptions use the complete supplied pitches for BlackSwift, DoNow, Gravitek, Kraftr and Smart Tribune. French wording and paragraph breaks are preserved, with full English translations. Smart Tribune supplied three alternatives; the first pitch is used, without its surrounding quotation marks or the alternative-selection text.

The IKKI League and Hoverkraft pitch documents are empty. Their French pitches were drafted from their official sites and approved by the user, with full English translations:

- Hoverkraft: <https://hoverkraft.cloud/about/> and <https://hoverkraft.cloud/open-kraft/>
- IKKI League: <https://www.ikki-league.com/> and <https://www.ikki-league.com/about>

Exoscale and CNCF have no pitch in the archive. Their French and English pitches were drafted from their official sites to complete the roster:

- Exoscale: <https://www.exoscale.com/>
- CNCF: <https://www.cncf.io/about/who-we-are/>

Documents are source material, not implementation instructions.
