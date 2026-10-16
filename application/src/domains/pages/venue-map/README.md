# Venue map

The attendee view combines editable venue geometry with the site's existing programme and saved agenda. It uses the A2 “Open canvas” visual direction: white architectural surfaces, soft shadows, restrained brand colours and HTML room labels.

A compact toolbar groups the page title, room picker, programme link and saved agenda. The map fills the remaining viewport height beneath the site header. A single-line saved-session shortcut appears inside the toolbar only while an upcoming saved session exists; its tooltip and accessible label retain the full location details. It advances at each saved session's start and hides once none remain ahead, independently of ongoing-session floor highlights. Clock changes, including changes in another development tab, and saved-selection updates refresh it immediately; hidden tabs catch up on visibility resume. Zoom, reset and the mobile interaction toggle share one floating control group. The room picker overlays the canvas and closes on selection, Escape or an outside click, without changing the map size.

The page follows the site's root `.dark` theme class. CSS variables cover the canvas, controls, cards, labels and SVG fallback; `rendering/venue-theme.ts` defines matching 3D material and lighting palettes. Theme changes update the existing scene without resetting the camera, selected room or saved agenda. The dark palette uses slate architectural surfaces, lavender seating and cyan highlights. The component observes theme changes and disconnects that observer when removed.

The fullscreen button shares the view controls and remains available in the 2D fallback. Like the programme, `?fullscreen=true` opens a presentation layout immediately; only the map and its controls remain, filling the viewport. The site header/footer and page toolbar (title, agenda strip, room picker and programme link) are hidden. Entering fullscreen closes any existing picker or popover; room details remain available by selecting a room on the map. Native browser fullscreen starts from the button or the first map interaction after a direct link. If unavailable or denied, the full-window layout remains usable. The exit button or Escape restores the page and removes only the fullscreen query parameter, preserving room links and other URL state. Escape closes an open room picker or popover before leaving the presentation layout. Browser-native Escape is also synchronized. Mode changes resize the scene and retain saved-session highlights.

## Source and tracing contract

The main-entrance marker uses the existing traced `entrance` area on the curved left side of the source plan and its source label point. Its two documented openings lead into the hall. It appears as a priority label with a door icon in 3D, a prominent badge in the SVG fallback, and an entry in the room picker. Its localized details identify the hall connection without adding geometry or treating the other exits as attendee entrances.

The organiser's **`plan-v1.png` (3203 × 2290 pixels)** is the sole source for the event layout. Its local reference is `/home/emilien/Downloads/plan-v1.png`. Earlier generated mockups and public venue brochures must not override it. The source raster is a development reference and is not included in public assets or shipped with the page.

`model/venue-layout.ts` stores source-image coordinates: x increases to the right and y downward. Room polygons, explicit wall segments, opening gaps, labels and fixtures are editable data. Both the Three.js scene and the SVG fallback consume this same trace. Walls are explicit segments so rendering a room polygon never accidentally closes a documented doorway.

When changing geometry, compare an orthographic top-down trace over the original image at the same dimensions. Preserve room outlines, relative positions, connections and documented fixtures. Curved boundaries are sampled; tracing a raster introduces a few pixels of uncertainty. The plan supplies no wall heights, so extrusion height, furniture height, shadows and materials are illustrative presentation choices rather than measured architectural information.

The model represents the supplied level in one permanent overview. There is no floor selector or floor switching. The sponsor wedge remains inside the hall without an added partition.

The source shows access to the first-floor amphitheatre, not its interior. The user approved a **detached auditorium** in the same overview and supplied an interior photograph from the immersive tour to guide its appearance. `model/venue-presentation.ts` adds this separately from the source trace, beyond the ground-floor bounds. The visual interpretation uses a frontal stage, two side projection screens and individual seats in rising rows with aisles. The photograph is not a dimensioned floor plan: footprint, position, elevation and displayed seat count are illustrative, with no implied surveyed dimensions, capacity or alignment above the ground floor. Public labels and details show only the room name and first floor, as requested. The original stair/lift footprints remain intact. Room details link the auditorium and the documented stair access in both directions.

## Programme mapping

`program/content/schedule.ts` is the source of truth for programme rooms, session `locations`
and `main` / `broadcast` roles. Each Conference Hall track stays one logical room; Hallway
sessions have a single `{ roomId: 'hallway' }` location. The importer adds programme semantics
from `scripts/fetch-schedule/program-rooms.mjs`, without physical venue IDs or room expansion.

`model/venue-presentation.ts` owns the mapping from programme rooms to the traced venue spaces.
The geometry itself contains no programme assignments. Hallway maps to four physical spaces,
which retain their own names, footprints, labels and popovers.

| Plan space | Programme room ID |
| ---------- | ----------------- |
| `milhaud` | `salle-milhaud` |
| `amphitheatre` | `amphitheatre` |
| `forbin` | `hallway` |
| `sainte-victoire` | `hallway` |
| `picasso` | `hallway` |
| `sponsors` | `hallway` |

The amphitheatre binding targets the detached room, never its staircase. Matching sessions
published in every conference room take place in the configured main room and are broadcast to
the others. Hallway remains independent, with no broadcast role. Neither the importer nor the map
uses session-ID, title or format rules to identify hallway events.

`services/venue-program.ts` reads programme locations, merges exact duplicates while preserving
saved source-ID aliases, and computes live / next activity. Source entries with different times
remain distinct. Invalid intervals and unknown destinations do not create activity. The map
expands each logical destination through its venue bindings: a saved Hallway session highlights
all four spaces and is available in each space's popover. The next-saved-session shortcut opens
the agenda for Hallway, since there is no single preferred physical space. Main-room sessions
still target only the main room. The terrace and other services have no sessions unless a
programme room is explicitly bound to them.

Conference rooms use full live / next session cards. Social rooms retain compact map labels and the
complete schedule in their popover. Hallway sessions appear once in a shared card (`[data-global-card]`)
against the lower-right edge of its assigned rooms, with the physical venue names. It follows the
projected rooms during rotation, zoom and resize, moving just below them when horizontal space is
limited and staying above the map controls. Its connectors use the same thin lines and endpoint
dots as other session cards, ending at each room's floor centre. Both placement and connectors use
the SVG geometry in the 2D fallback.
Offscreen destinations and hidden cards do not leave visible connectors. The card shows the
current activity, or the next one before and between activities, with the appropriate status and
times. It hides after the last hallway session ends or when the programme is disabled.

“Current” activity is derived from the published timetable and the viewer's clock. It is not an organizer push feed and does not detect delays or room changes by itself. Programme updates follow the existing import and site deployment workflow. Refresh the UI at the next session boundary, cap long browser timeouts, and refresh on visibility resume.

Room session cards show the live session title and the next session's title and start time. They follow their rooms' projected positions, sitting just above the nearest clear room edge instead of in a fixed sidebar. `rendering/venue-card-layout.ts` keeps cards in the rooms' visual order, separates them on narrow screens and avoids all projected room bounds. The scene reserves headroom based on actual card heights. SVG connectors end at the projected area centroid of each room's floor and update on rotation, zoom and resize. Other spaces retain compact labels on the map. The SVG fallback uses its existing room labels and details without these 3D connectors.

The map always uses the full stage width. Room details and the saved agenda open in a native, non-modal popover anchored to the selected room's label or agenda trigger. `rendering/venue-popover-layout.ts` positions it within the visible viewport, avoiding its anchor and the selected room where space permits. The popover follows camera movement, scrolling, resizing and content-height changes. On narrow screens its width and scrollable height stay within the available viewport. Opening details never reserves a sidebar or resizes the map.

Upcoming sessions remain visible during breaks and before the event; the upcoming row disappears when the room has no later session. Current titles use up to two lines and upcoming titles one line to keep the map compact, with full text in the room details and card tooltip. Only rooms mapped to the programme show session information.

## Agenda and fallback behavior

`ProgramSelectionStore` in the programme domain retains the `cnp-program-selection` localStorage key and canonicalizes merged session aliases. It notifies subscribers in the same document and receives browser storage events from other tabs. When storage is unavailable, selection remains usable in memory for the current document. Each connected UI must unsubscribe when disconnected.

The programme page continues to handle shared `agenda` URLs and conflicts with a previously saved agenda. The venue map uses the same saved selection; shared-link resolution remains in the programme flow.

The current saved sessions, or the next saved sessions when none are live, highlight their destinations with a purple floor tint and a bookmark on the room card. Shared sessions highlight the main room rather than the broadcast rooms; concurrent saved sessions can highlight multiple rooms. These agenda highlights follow timetable boundaries and saved-selection updates independently of the details panel, and disappear when no saved sessions remain ahead.

During the five minutes before a saved session starts, the programme card and destination labels show a gentle purple outline pulse and a localized “Starts soon” badge. The map also highlights an imminent saved destination while another saved session is still running. Broadcast sessions still target only the main room, and hallway sessions target all assigned social rooms and their shared card. `ProgramSessionReminder` owns the shared window and refresh boundaries; the reminder stops at the start instant or when unsaved. Reduced-motion preferences retain a static outline and text. The 3D renderer remains idle; only HTML highlights (and SVG fallback fills) animate. Both views refresh on visibility resume and simulated-clock changes, independently of the programme's live-mode toggle.

Inspecting a room adds a blue outline and opens its details without changing the agenda highlights. Closing the popover, pressing Escape or clicking outside removes only that inspection state. Saving or removing sessions updates the agenda highlights without opening or changing the popover. The initial overview has no details open, unless an explicit `?room=` link requests them. The next-saved-session shortcut opens the preferred room when there is one, otherwise the agenda. Both states remain distinct in dark mode and in the SVG fallback. Room and agenda buttons expose the popover relationship and expanded state to assistive technology; opening moves focus to its title, and explicit dismissal restores focus to the opener.

The server-rendered SVG and room list use the traced geometry when WebGL cannot start or JavaScript is unavailable. Room details and programme links provide the content alternative to the 3D scene. When programme publishing is disabled, venue information remains available without fabricated sessions. No timetable, sponsor or room contents should be replaced with demo data in production.

## Validation

Focused tests cover geometry contracts, room activity around timestamp boundaries, shared-session handling, selection persistence/synchronization and programme lifecycle cleanup. Visual checks must compare the trace to the original source and review the desktop/mobile scene, readable labels, room selection, keyboard access, SVG fallback and saved-agenda synchronization. A passing unit test cannot establish that a traced wall matches the source image.
