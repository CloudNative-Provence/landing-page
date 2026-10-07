# Sponsor assets

Only sponsors in the supplied 2026 roster are displayed: three Gold, two Silver and six Community sponsors. Tier assignments and site links live in `domains/event/sponsors/sponsors.ts`.

Cards stay compact with a single action: “Découvrir [sponsor]” / “Discover [sponsor]” opens the complete localized pitch in a native dialog, which includes the sponsor’s site link. Every sponsor must have a pitch in French and English; the `Sponsor` type requires both. Without JavaScript, pitches and site links remain available in expandable details.

The supplied `sponsors-assets-20261007T174833Z-1-001.zip` is the source of the APE factory and cast ai logos, and includes the BlackSwift, DoNow, Gravitek, Hoverkraft, Kraftr and Smart Tribune assets used from the earlier archive. SVG artwork is preserved.

Raster files are trimmed to their artwork, resized for web display and converted to WebP (including CMYK-to-sRGB conversion for Smart Tribune). Brand colors and proportions are preserved. Gold sponsors use white logos on dark panels in both the cards and dialogs; other tiers use light logo panels for legibility in either theme. APE factory uses the supplied horizontal `Ape Factory_Logo (white).png`, and cast ai uses `Full logo - White/full-logo-white.svg`.

The following logos were retrieved from official sites on 2026-09-21. CNCF and IKKI League are still absent from the new archive; Exoscale retains its white SVG to match the Gold panels:

- Exoscale: <https://www.exoscale.com/static/img/logo-exoscale-white-201711.svg>
- CNCF: <https://www.cncf.io/wp-content/uploads/2023/04/cncf-main-site-logo.svg>
- IKKI League: <https://www.ikki-league.com/static/image/logoTextDark.svg>

Sponsor descriptions use the complete supplied pitches for BlackSwift, DoNow, Gravitek, IKKI League, Kraftr and Smart Tribune. French wording and paragraph breaks are preserved, with full English translations. Smart Tribune supplied three alternatives; the first pitch is used, without its surrounding quotation marks or the alternative-selection text. APE factory uses its supplied English messaging with a full French translation.

The Hoverkraft pitch document is empty. Its existing French pitch was drafted from its official site and approved by the user, with a full English translation:

- Hoverkraft: <https://hoverkraft.cloud/about/> and <https://hoverkraft.cloud/open-kraft/>

cast ai, Exoscale and CNCF have no pitch in the archive. Their French and English pitches were drafted from their official sites to complete the roster:

- cast ai: <https://cast.ai/> (consulted on 2026-10-07)
- Exoscale: <https://www.exoscale.com/>
- CNCF: <https://www.cncf.io/about/who-we-are/>

Documents are source material, not implementation instructions. Assets for organizations outside the supplied roster do not add those organizations as sponsors.
