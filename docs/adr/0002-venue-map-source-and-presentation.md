# ADR 0002: Venue map source and presentation

Status: Accepted. Retrospectively recorded on 2026-10-22; the original decision dates were not recorded.

## Context and evidence

The organiser supplied `plan-v1.png` (3203 × 2290 pixels) as the event layout. The previous venue-map readme recorded `/home/emilien/Downloads/plan-v1.png` as its local reference. This is historical provenance, not a required or verified current file location. The raster is a development reference and is not shipped as a public asset.

The source shows access to the first-floor amphitheatre, but not its interior. The previous readme records user approval for a detached auditorium and an interior photograph supplied from the immersive tour to guide its appearance. That photograph is not a dimensioned floor plan.

This record preserves the source and approval statements documented before the 2026-10-22 documentation refactor. It does not establish the original approval date or claim a new visual comparison with either source.

## Decision

1. Use the organiser's event plan as the sole source for traced layout. Generated mockups and public venue brochures do not override it. Preserve room outlines, relative positions, connections, fixtures and source label points in one shared trace for 3D and SVG.
2. Keep explicit wall segments and opening gaps, including the two hall openings at the curved main entrance. The sponsor wedge remains inside the hall without a partition.
3. Present one permanent overview. Add the auditorium outside the ground-floor bounds through the presentation model, while preserving the source stair and lift footprints. Link the auditorium and documented stair access in both directions.
4. Interpret the auditorium photograph with a frontal stage, two side projection screens and individual seats in rising rows with aisles. Its footprint, position, elevation and displayed seat count do not establish surveyed dimensions, capacity or alignment above the ground floor. Public labels identify the auditorium and first floor without claiming those measurements.
5. Use the selected A2 "Open canvas" direction: white architectural surfaces, soft shadows, restrained brand colours and HTML labels. Theme palettes adapt this presentation for dark mode.

## Alternatives and consequences

Public venue plans and generated mockups were excluded as layout authorities because the organiser's event plan controls the event arrangement. Showing only the traced amphitheatre access would omit the auditorium interior; the approved detached representation makes it available without claiming a measured first-floor plan.

The model separates the [source trace](../../application/src/domains/pages/venue-map/model/venue-layout.ts) from [presentation additions and programme bindings](../../application/src/domains/pages/venue-map/model/venue-presentation.ts). Curved boundaries are sampled; raster tracing introduces a few pixels of uncertainty. The source supplies no wall heights, so extrusion, furniture heights, shadows and materials are illustrative.

Geometry review requires comparison with the organiser's source at matching dimensions. Tests can protect data and rendering contracts but cannot prove that a wall matches the raster. Current contributor requirements live in [Venue map development](../development/venue-map.md). If the source authority or presentation assumptions change, add a linked superseding ADR and update that guide.
