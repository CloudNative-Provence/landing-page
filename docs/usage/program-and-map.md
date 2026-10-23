# Programme and venue map

Open the [conference site](https://cloudnative-provence.fr), choose your language,
and select Programme or Venue map from the navigation. A browser with JavaScript
enabled supports saving sessions, sharing an agenda, and interactive map controls.

## Build your agenda

1. Browse the programme and filter by room or search for a session.
2. Open a session for its description and speaker profiles.
3. Save sessions to your agenda. Use "Share my schedule" to create a link or
   "Export to calendar" to download your selected sessions.

Your selection is stored in your browser and shared between the programme, map,
and other tabs on the same site. Use a share link to carry it to another browser
or device. If a shared agenda differs from your saved selection, the programme
asks which to keep. When browser storage is unavailable, selections last only
for the current document.

## Find a room

Select a room on the map or in the room picker to open its details and programme.
The map highlights destinations for your current saved sessions, or the next saved
sessions when none are running. A "Starts soon" reminder appears during the five
minutes before a saved session. The next-session shortcut opens its room or the
agenda when it has several destinations.

Use the zoom and reset controls to adjust the view. If 3D rendering is unavailable,
the map provides an interactive 2D fallback. Without JavaScript, the static map,
room labels, and programme link remain available.

## Live view and fullscreen

Enable "Live view" on the programme to highlight current sessions and dim past ones.
Activity follows the published timetable and your device's clock; it does not detect
delays or unannounced room changes. Refresh the page to load a newly published schedule.

Use the fullscreen control on the programme or map for a display that fills the window.
A direct fullscreen link activates that layout immediately; interact with the page
to request browser fullscreen. If the browser declines, the map keeps its fullscreen
layout and the programme returns to its normal layout.

Use the exit button to leave either layout. Escape exits native browser fullscreen.
On the map, Escape also exits the window-filling layout, closing open room details
or the picker first.

These query parameters can be combined:

| Page             | Parameter         | Effect                                              |
| ---------------- | ----------------- | --------------------------------------------------- |
| Programme        | `agenda=<token>`  | Opens the selection created by "Share my schedule". |
| Programme        | `live=true`       | Enables live view.                                  |
| Programme or map | `fullscreen=true` | Opens the fullscreen layout.                        |
| Map              | `room=<room-id>`  | Opens a room's details.                             |

For a wall display, use `/fr/programme?fullscreen=true&live=true` or
`/en/program?fullscreen=true&live=true` on the conference site.
