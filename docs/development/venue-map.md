# Venue map development

The venue map combines editable geometry, programme locations and the shared saved agenda. For attendee controls and limitations, see [Programme and map](../usage/program-and-map.md). [ADR 0002](../adr/0002-venue-map-source-and-presentation.md) records source provenance and presentation decisions.

## Geometry and presentation

[`venue-layout.ts`](../../application/src/domains/pages/venue-map/model/venue-layout.ts) owns room polygons, wall segments, openings, label points and fixtures in source-image coordinates: x increases rightward, y downward. Both the 3D scene and server-rendered SVG use this trace.

- Preserve documented connections and fixtures. Walls are explicit segments; deriving closed walls from room polygons would block doorways.
- Keep the sponsor wedge open inside the hall. Use the traced `entrance` area and its two hall openings for the main entrance.
- Compare geometry edits with an orthographic trace over the original `plan-v1.png`. Curves are sampled and raster tracing has a few pixels of uncertainty. Heights and materials are illustrative.
- Keep the source raster outside public assets. Obtain the organiser's reference before reviewing geometry accuracy.

[`venue-presentation.ts`](../../application/src/domains/pages/venue-map/model/venue-presentation.ts) adds programme bindings and the detached first-floor auditorium without altering the ground-floor trace. The auditorium and its stair access link to each other; programme sessions belong to the auditorium. Its footprint, position, elevation and seat count are illustrative and must not imply measured dimensions or capacity. The map uses one overview, without floor switching.

## Programme and agenda contracts

[`program/content/schedule.ts`](../../application/src/domains/pages/program/content/schedule.ts) supplies logical rooms, session `locations` and `main` / `broadcast` roles. The importer uses [`program-rooms.mjs`](../../scripts/fetch-schedule/program-rooms.mjs) for programme semantics; physical destinations belong only to `venue-presentation.ts`.

| Programme room  | Physical spaces                                    |
| --------------- | -------------------------------------------------- |
| `amphitheatre`  | `amphitheatre`                                     |
| `salle-milhaud` | `milhaud`                                          |
| `hallway`       | `forbin`, `sainte-victoire`, `picasso`, `sponsors` |

Hallway's physical spaces retain their own names and details. Follow the imported locations and roles described in the [programme guide](program.md#rooms-and-session-identity); do not infer them again from session IDs, titles or formats.

[`VenueProgram`](../../application/src/domains/pages/venue-map/services/venue-program.ts) merges duplicate sessions while preserving saved source-ID aliases. Different time intervals stay distinct; invalid intervals and unknown destinations produce no room activity. Unbound services and outdoor spaces have no sessions.

Preserve these state boundaries:

- Room activity comes from the published timetable and `AppClock`. Refresh at reminder/start/end boundaries, on visibility resume and on clock changes; cap long browser timeouts. Schedule updates require an import and deployment.
- Saved destinations show current saved sessions, or the next saved sessions when none are live. Keep concurrent destinations. Broadcast sessions highlight their main room; Hallway expands to all four spaces.
- The next-session shortcut includes only upcoming saved sessions and advances when they start. It opens a unique physical destination, otherwise the agenda.
- [`ProgramSessionReminder`](../../application/src/domains/pages/program/services/session-reminder.ts) owns the five-minute reminder window, including imminent sessions while another saved session is live. Respect reduced motion and keep reminder animation outside the 3D render loop.
- Use the shared [`ProgramSelectionStore`](program.md#rooms-and-session-identity) for agenda persistence and subscriptions. Shared `agenda` URL resolution stays in the programme flow.
- Room inspection and agenda highlights are independent. Opening or dismissing details must not change saved destinations; saving must not change the inspected room.

## Rendering and interaction

[`VenueMap.astro`](../../application/src/domains/pages/venue-map/components/VenueMap.astro) renders the SVG, room labels and programme link. [`venue-map-element.ts`](../../application/src/domains/pages/venue-map/components/venue-map-element.ts) loads the scene, updates activity and coordinates interactions.

- Keep the map at full stage width. The toolbar and overlaid room picker must not resize it. Details and agenda use a non-modal popover; [`VenuePopoverLayout`](../../application/src/domains/pages/venue-map/rendering/venue-popover-layout.ts) follows its anchor within the viewport as the camera, scroll position or content size changes.
- Conference rooms show current/next cards. Hallway uses one shared card connected to all visible destinations, including in SVG fallback. [`VenueCardLayout`](../../application/src/domains/pages/venue-map/rendering/venue-card-layout.ts) keeps cards clear of rooms and controls. Connectors end at floor centres; hidden cards and offscreen destinations leave no connectors.
- Preserve full session titles in room details and card tooltips. Keep the main-entrance label prominent and its room-picker entry available.
- Match the root `.dark` class through CSS variables and [`venue-theme.ts`](../../application/src/domains/pages/venue-map/rendering/venue-theme.ts). Update scene materials in place without resetting the camera or selection.
- [`VenueFullscreen`](../../application/src/domains/pages/venue-map/services/venue-fullscreen.ts) synchronizes `?fullscreen=true`, browser fullscreen and the full-window fallback. Entering closes overlays; Escape dismisses an open overlay before leaving presentation. Exiting preserves other query parameters. Resize the scene and retain saved highlights through mode changes.
- Start without room details unless `?room=` requests a public room. Expose expanded state and popover relationships; focus the details title when opening and restore the opener on explicit dismissal.
- Preserve interactive SVG details when WebGL is unavailable. Without JavaScript, the geometry, room labels and programme link remain visible; details and agenda require JavaScript. When programme publishing is disabled, show venue information without sessions or demo content.
- Dispose scene resources, observers, listeners, timers and selection subscriptions on disconnect. Rendering must settle when idle.

## Validation

From `application/`, run the tests for changed contracts:

```sh
npx vitest run src/domains/pages/venue-map src/domains/pages/program/services/selection-store.test.ts src/domains/pages/program/services/session-reminder.test.ts
```

For geometry changes, compare the trace with the original raster; unit tests cannot establish visual accuracy. For rendering or interaction changes, check desktop and mobile layouts, both themes, keyboard/focus behavior, room selection, SVG fallback, fullscreen and agenda synchronization. These are acceptance checks to perform for the change, not a record of completed validation.
