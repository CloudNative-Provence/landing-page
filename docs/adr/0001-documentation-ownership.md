# ADR 0001: Documentation ownership

- Status: Accepted
- Date: 2026-10-22

## Context

The root readme combined attendee features, development commands, source placement,
and implementation details. Component readmes also mixed active contracts with
venue design history and dated sponsor-source evidence. Repeated explanations
made it difficult to keep instructions aligned with the code.

## Decision

Keep root readmes focused on end users and link to `docs/`. Give each topic a
canonical guide under `docs/usage/` or `docs/development/`, indexed by `docs/README.md`.
Component readmes state their purpose and link to those guides. Preserve significant
decision history and dated evidence in `docs/adr/`.

Maintain current instructions alongside implementation changes. Remove obsolete
workflows, compatibility instructions, and migration narratives from active guides.
GitHub Actions and Workflows readmes remain generated artifacts; edit their sources
and use the established generator rather than editing output manually.

Enforce these rules through repository agent guidance, Copilot instructions, and
the pull-request checklist, all pointing to the documentation policy.

## Alternatives

- A single root guide avoids navigation but mixes audiences and grows with each feature.
- Detailed component readmes keep prose near code but scatter contributor procedures
  and duplicate shared contracts.

## Consequences

Readers follow links for detailed procedures. Contributors update links and anchors
when moving topics and validate claims against maintained source. Accepted ADRs
remain available when superseded; historical evidence does not count as current
validation. No readme generator is configured in this checkout, so the policy does
not prescribe an unverified generation command.
