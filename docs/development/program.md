# Programme maintenance

For attendee controls and share links, see the [usage guide](../usage/program-and-map.md).

## Import the schedule

Keep session edits in Conference Hall. Set `CONFERENCE_HALL_API_KEY` in your shell,
then run from the repository root:

```bash
make fetch-schedule
```

The [CLI](../../scripts/fetch-schedule/cli.mjs) reads the event ID from
`event.cfp.submissionUrl` in [`config.yaml`](../../application/src/config.yaml)
and fetches Conference Hall's `/api/v1/event/:event/schedule` export. It regenerates
[`schedule.ts`](../../application/src/domains/pages/program/content/schedule.ts),
shared by both locales. Review the resulting diff before committing it.

The importer preserves source titles, descriptions, speakers, session IDs, times,
and entries without a talk proposal. Empty or invalid responses fail before the
existing file is replaced. All published days and session boundaries must fall on
the same calendar date as `event.startsAt` in `event.timeZone`; the page also checks
this during generation.
If validation fails, correct the event configuration or Conference Hall schedule
and rerun the import. Do not patch the generated file to bypass validation.

The [scheduled workflow](../../.github/workflows/fetch-schedule.yml) uses the same
importer; see [CI and deployment](ci.md). Both entrypoints enable Node's type
stripping to load the shared TypeScript date validator.

## Rooms and session identity

Each published track becomes one logical programme room. Session assignments use
`locations: [{ roomId, role? }]`; physical venue bindings belong to the
[venue-map domain](venue-map.md).

[`program-rooms.mjs`](../../scripts/fetch-schedule/program-rooms.mjs) supplies room
metadata, including the main room and Hallway. Matching sessions published in every
conference room receive `main` and `broadcast` locations. Hallway stays independent
with one logical location. Track assignment determines location, regardless of a
session's title or format.

The timetable aligns room columns at shared time boundaries and recalculates after
filtering. Matching sessions across all conference rooms render once; source IDs
remain valid when sessions are merged. The small-screen view is chronological.
Session descriptions and speaker biographies render Markdown.

[`ProgramSelectionCodec`](../../application/src/domains/pages/program/services/selection-codec.ts)
generates compressed ID-based share tokens that tolerate changes in schedule order.
[`ProgramSelectionStore`](../../application/src/domains/pages/program/services/selection-store.ts)
persists IDs under `cnp-program-selection`, normalizes merged aliases, and notifies
the document and other tabs. If storage fails, it retains selection in memory for
the document. UI consumers must unsubscribe on disconnect. The programme resolves
conflicts between a shared link and a saved agenda.

Fullscreen URL handling lives in
[`shared/url/fullscreen-view.ts`](../../application/src/shared/url/fullscreen-view.ts).

## Preview an event time

With `make start` running, use the browser console:

```js
devClock.set("2026-12-10T09:20:00+01:00");
devClock.now();
devClock.reset();
```

Choose a date from the configured event. Supply `Z` or an explicit timezone offset.
The clock keeps ticking, persists in localStorage, and synchronizes across tabs on
the same origin. If storage is blocked, it lasts only for the current document.
`reset()` removes the override and restores real time.

The DEV indicator shows time in the event's timezone. Click its timestamp to edit
it; nonexistent daylight-saving times are rejected and repeated autumn times use
their first occurrence. Map activity, saved-session highlights, event-day navigation,
countdown, and programme live view refresh on changes. Enable `?live=true` to inspect
live programme badges.

The helper and indicator are development-only. They affect the browser application
clock, leaving native `Date`, configured event dates, and server-rendered content
unchanged. The implementation lives in [`shared/time/`](../../application/src/shared/time/).

## Validation

Run `npm --prefix application run test:schedule` for importer changes. Programme
tests are colocated under its `model/`, `services/`, and `components/` directories.
Run `make build` after changing the event configuration or imported schedule.
