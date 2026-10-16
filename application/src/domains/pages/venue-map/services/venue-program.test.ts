import { describe, expect, it } from 'vitest';

import programSchedule from '../../program/content/schedule';
import type { ProgramRoom, ProgramSession } from '../../program/model/schedule';
import { VenueProgram } from './venue-program';

const rooms: ProgramRoom[] = [
  { id: 'milhaud', label: 'Milhaud', accent: 'blue' },
  { id: 'amphitheatre', label: 'Amphitheatre', accent: 'purple' },
  { id: 'hallway', label: 'Hallway', accent: 'orange', kind: 'hallway' },
];
const talk: ProgramSession = {
  id: 'talk',
  locations: [{ roomId: 'milhaud' }],
  title: 'Cloud platforms',
  description: 'A talk',
  startsAt: '2026-12-10T10:00:00+01:00',
  endsAt: '2026-12-10T10:30:00+01:00',
};
const nextTalk: ProgramSession = {
  ...talk,
  id: 'next-talk',
  title: 'Next talk',
  startsAt: '2026-12-10T11:00:00+01:00',
  endsAt: '2026-12-10T11:30:00+01:00',
};
const breakSession: ProgramSession = {
  ...talk,
  id: 'a-break',
  title: 'Shared talk',
  locations: [
    { roomId: 'amphitheatre', role: 'main' },
    { roomId: 'milhaud', role: 'broadcast' },
  ],
  startsAt: '2026-12-10T10:30:00+01:00',
  endsAt: '2026-12-10T11:00:00+01:00',
};

describe('VenueProgram', () => {
  it('finds the earliest upcoming sessions regardless of input order or malformed entries', () => {
    const programme = new VenueProgram([nextTalk, { ...talk, id: 'invalid', startsAt: 'invalid' }, talk], rooms);
    const beforeEvent = new Date('2026-10-15T00:00:00Z');
    expect(programme.getRoomState('milhaud', beforeEvent).next.map((session) => session.id)).toEqual(['talk']);
    expect(programme.getNextSavedSessions(['next-talk', 'talk'], beforeEvent).map((session) => session.id)).toEqual([
      'talk',
    ]);
  });

  it('shows upcoming sessions before the event and respects exact start/end instants', () => {
    const programme = new VenueProgram([nextTalk, talk], rooms);
    expect(programme.getRoomState('milhaud', new Date('2026-10-15T10:00:00Z'))).toMatchObject({
      current: [],
      next: [{ id: 'talk' }],
    });
    expect(programme.getRoomState('milhaud', new Date('2026-12-10T09:00:00Z')).current.map((s) => s.id)).toEqual([
      'talk',
    ]);
    expect(programme.getRoomState('milhaud', new Date('2026-12-10T09:30:00Z'))).toMatchObject({
      current: [],
      next: [{ id: 'next-talk' }],
    });
    expect(programme.getRoomState('milhaud', new Date('2026-12-11T00:00:00Z'))).toMatchObject({
      current: [],
      next: [],
    });
  });

  it('reads generated broadcast roles and preserves saved aliases', () => {
    const programme = new VenueProgram([talk, breakSession, { ...breakSession, id: 'b-break' }], rooms);
    const breakTime = new Date('2026-12-10T09:45:00Z');
    for (const room of rooms.filter((room) => room.kind !== 'hallway')) {
      expect(programme.getRoomState(room.id, breakTime).current.map((session) => session.id)).toEqual(['a-break']);
    }
    for (const id of ['a-break', 'b-break']) {
      expect(programme.getSessionLocations(id)).toEqual([
        { roomId: 'amphitheatre', role: 'main' },
        { roomId: 'milhaud', role: 'broadcast' },
      ]);
      expect(programme.getPreferredRoomId(id)).toBe('amphitheatre');
    }
    expect(programme.getSessionLocations('talk')).toEqual([{ roomId: 'milhaud' }]);
    expect(programme.getPreferredRoomId('talk')).toBe('milhaud');
    expect(programme.canonicalIds.get('b-break')).toBe('a-break');
    expect(programme.getNextSavedSessions(['a-break', 'b-break'], breakTime)).toMatchObject([
      { id: 'a-break', locations: breakSession.locations },
    ]);
  });

  it('reads the opening keynote locations from the generated schedule', () => {
    const programme = new VenueProgram(programSchedule.sessions, programSchedule.rooms);
    const keynote = programme.sessions.find((session) => session.format === 'keynote')!;
    expect(keynote.sourceIds).toHaveLength(2);
    expect(programme.sessions.filter((session) => session.format === 'keynote')).toHaveLength(1);

    for (const room of ['amphitheatre', 'salle-milhaud']) {
      expect(programme.getRoomState(room, new Date('2026-12-10T09:00:00+01:00')).next).toEqual([keynote]);
      expect(programme.getRoomState(room, new Date(keynote.startsAt)).current).toEqual([keynote]);
      expect(programme.getRoomState(room, new Date(keynote.endsAt)).current).not.toContain(keynote);
    }
    for (const id of keynote.sourceIds) {
      expect(programme.getPreferredRoomId(id)).toBe('amphitheatre');
      expect(programme.getSessionRoomIds(id)).toEqual(['amphitheatre', 'salle-milhaud']);
      expect(programme.getSessionLocations(id)).toEqual([
        { roomId: 'amphitheatre', role: 'main' },
        { roomId: 'salle-milhaud', role: 'broadcast' },
      ]);
    }
    expect(programme.getNextSavedSessions(keynote.sourceIds, new Date(keynote.startsAt))).toEqual([keynote]);
  });

  it('keeps hallway activity and saved destinations in the single generated programme room', () => {
    const programme = new VenueProgram(programSchedule.sessions, programSchedule.rooms);
    const lunch = programme.getHallwayState().sessions[0];
    const now = new Date(lunch.startsAt);
    const destinations = ['hallway'];
    for (const roomId of destinations) {
      expect(programme.getRoomState(roomId, now).current).toContain(lunch);
    }
    for (const roomId of ['amphitheatre', 'salle-milhaud']) {
      expect(programme.getRoomState(roomId, now).current).not.toContain(lunch);
    }
    for (const id of lunch.sourceIds) {
      expect(programme.getSessionLocations(id)).toEqual(destinations.map((roomId) => ({ roomId })));
      expect(programme.getPreferredRoomId(id)).toBe('hallway');
      expect(programme.getPlannedRoomIds([id], now)).toEqual(destinations);
    }
    for (const session of programme.getHallwayState().sessions) {
      expect(programme.getSessionRoomIds(session.id)).toEqual(destinations);
    }
  });

  it('uses the main role from locations independently of room names', () => {
    const locations = [
      { roomId: 'milhaud', role: 'main' as const },
      { roomId: 'amphitheatre', role: 'broadcast' as const },
    ];
    const programme = new VenueProgram([{ ...talk, locations }], rooms);
    expect(programme.getSessionLocations('talk')).toEqual(locations);
    expect(programme.getPreferredRoomId('talk')).toBe('milhaud');
    expect(programme.getPlannedRoomIds(['talk'], new Date(talk.startsAt))).toEqual(['milhaud']);
  });

  it.each([undefined, '', '  ', 'Workshop'])(
    'keeps hallway activity available regardless of format before, during and between slots (%j)',
    (format) => {
      const locations = [{ roomId: 'hallway' }];
      const coffee = { ...talk, id: 'coffee', title: 'Coffee', format, locations };
      const extended = { ...coffee, id: 'extended', endsAt: '2026-12-10T10:45:00+01:00' };
      const lunch = { ...nextTalk, id: 'lunch', title: 'Lunch', format, locations };
      const programme = new VenueProgram(
        [
          lunch,
          { ...talk, id: 'formatted', title: 'Talk', format: 'Talk', startsAt: '2026-12-10T09:00:00+01:00' },
          extended,
          coffee,
        ],
        rooms
      );

      expect(programme.getHallwayState(new Date('2026-10-16T12:00:00Z'))).toMatchObject({
        current: [],
        next: [{ id: 'coffee' }, { id: 'extended' }],
      });
      expect(programme.getHallwayState(new Date(coffee.startsAt))).toMatchObject({
        current: [{ id: 'coffee' }, { id: 'extended' }],
        next: [{ id: 'lunch' }],
      });
      expect(programme.getHallwayState(new Date(coffee.endsAt))).toMatchObject({
        current: [{ id: 'extended' }],
        next: [{ id: 'lunch' }],
      });
      expect(programme.getHallwayState(new Date(extended.endsAt))).toMatchObject({
        current: [],
        next: [{ id: 'lunch' }],
      });
      expect(programme.getHallwayState(new Date(lunch.startsAt))).toMatchObject({
        current: [{ id: 'lunch' }],
        next: [],
      });
      expect(programme.getHallwayState(new Date(lunch.endsAt))).toMatchObject({ current: [], next: [] });
    }
  );

  it('excludes conference sessions without a format, unknown destinations and invalid times from hallway activity', () => {
    const programme = new VenueProgram(
      [
        talk,
        { ...talk, id: 'formatted', format: 'Talk' },
        { ...talk, id: 'unassigned', locations: [] },
        { ...talk, id: 'unknown', locations: [{ roomId: 'missing' }] },
        { ...talk, id: 'invalid', startsAt: 'invalid', locations: [{ roomId: 'hallway' }] },
      ],
      rooms
    );
    expect(programme.getHallwayState(new Date(talk.startsAt))).toEqual({ sessions: [], current: [], next: [] });
    expect(new VenueProgram([], rooms).getHallwayState()).toEqual({ sessions: [], current: [], next: [] });
  });

  it('does not infer broadcasts or invent locations for unassigned and unknown rooms', () => {
    const programme = new VenueProgram(
      [
        talk,
        { ...talk, id: 'other-source', locations: [{ roomId: 'amphitheatre' }] },
        { ...talk, id: 'unassigned', locations: [] },
        { ...talk, id: 'unknown-room', locations: [{ roomId: 'missing' }] },
        { ...talk, id: 'empty', locations: [] },
      ],
      rooms
    );
    expect(programme.getSessionLocations('talk')).toEqual([{ roomId: 'milhaud' }]);
    expect(programme.getPreferredRoomId('talk')).toBe('milhaud');
    expect(programme.getSessionLocations('other-source')).toEqual([{ roomId: 'amphitheatre' }]);
    expect(programme.getPreferredRoomId('other-source')).toBe('amphitheatre');
    for (const id of ['unassigned', 'unknown-room', 'empty', 'missing']) {
      expect(programme.getSessionLocations(id)).toEqual([]);
      expect(programme.getPreferredRoomId(id)).toBeNull();
    }
  });

  it('retains concurrent saved sessions and prioritizes ongoing sessions over later ones', () => {
    const concurrent = { ...talk, title: 'Another topic', id: 'other-talk', locations: [{ roomId: 'amphitheatre' }] };
    const programme = new VenueProgram([nextTalk, concurrent, talk], rooms);
    const selected = ['talk', 'other-talk', 'next-talk', 'unknown'];
    expect(
      programme.getNextSavedSessions(selected, new Date('2026-12-10T08:00:00Z')).map((session) => session.id)
    ).toEqual(['other-talk', 'talk']);
    expect(
      programme.getNextSavedSessions(selected, new Date('2026-12-10T09:10:00Z')).map((session) => session.id)
    ).toEqual(['other-talk', 'talk']);
    expect(
      programme.getNextSavedSessions(selected, new Date('2026-12-10T09:45:00Z')).map((session) => session.id)
    ).toEqual(['next-talk']);
    expect(programme.getNextSavedSessions(selected, new Date('2026-12-11T00:00:00Z'))).toEqual([]);
    expect(programme.getNextSavedSessions([], new Date('2026-12-10T09:10:00Z'))).toEqual([]);
  });

  it('advances the next-session shortcut at the start instant while preserving ongoing map highlights', () => {
    const extendedTalk = { ...talk, endsAt: nextTalk.endsAt };
    const programme = new VenueProgram([nextTalk, breakSession, extendedTalk], rooms);
    const saved = ['talk', 'a-break', 'next-talk'];
    expect(
      programme.getUpcomingSavedSessions(saved, new Date(Date.parse(talk.startsAt) - 1)).map((session) => session.id)
    ).toEqual(['talk']);
    expect(programme.getUpcomingSavedSessions(saved, new Date(talk.startsAt)).map((session) => session.id)).toEqual([
      'a-break',
    ]);
    expect(programme.getPlannedRoomIds(saved, new Date(talk.startsAt))).toEqual(['milhaud']);
    expect(
      programme.getUpcomingSavedSessions(saved, new Date(breakSession.startsAt)).map((session) => session.id)
    ).toEqual(['next-talk']);
    expect(programme.getUpcomingSavedSessions(saved, new Date(nextTalk.startsAt))).toEqual([]);
    expect(programme.getUpcomingSavedSessions(saved, new Date(nextTalk.endsAt))).toEqual([]);
  });

  it('keeps concurrent upcoming choices and saved source aliases without including unsaved sessions', () => {
    const concurrent = {
      ...breakSession,
      id: 'concurrent',
      title: 'Another topic',
      locations: [{ roomId: 'milhaud' }],
    };
    const programme = new VenueProgram(
      [talk, nextTalk, breakSession, { ...breakSession, id: 'b-break' }, concurrent],
      rooms
    );
    const now = new Date(talk.startsAt);
    expect(
      new Set(
        programme
          .getUpcomingSavedSessions(['a-break', 'b-break', 'concurrent', 'missing'], now)
          .map((session) => session.id)
      )
    ).toEqual(new Set(['a-break', 'concurrent']));
    expect(programme.getUpcomingSavedSessions(['b-break'], now).map((session) => session.id)).toEqual(['a-break']);
    expect(programme.getUpcomingSavedSessions(['talk', 'missing'], now)).toEqual([]);
    expect(programme.getUpcomingSavedSessions([], now)).toEqual([]);
  });

  it('highlights current saved rooms, then the next saved rooms, and clears them after the agenda ends', () => {
    const concurrent = { ...talk, title: 'Another topic', id: 'other-talk', locations: [{ roomId: 'amphitheatre' }] };
    const programme = new VenueProgram([nextTalk, concurrent, talk], rooms);
    const selected = ['talk', 'other-talk', 'next-talk', 'unknown'];
    for (const time of ['2026-12-10T08:00:00Z', '2026-12-10T09:10:00Z']) {
      expect(new Set(programme.getPlannedRoomIds(selected, new Date(time)))).toEqual(
        new Set(['milhaud', 'amphitheatre'])
      );
    }
    expect(programme.getPlannedRoomIds(selected, new Date('2026-12-10T09:30:00Z'))).toEqual(['milhaud']);
    expect(programme.getPlannedRoomIds(selected, new Date('2026-12-10T10:30:00Z'))).toEqual([]);
    expect(programme.getPlannedRoomIds([], new Date('2026-12-10T09:10:00Z'))).toEqual([]);
  });

  it('highlights only the main room for a shared saved session, including source aliases', () => {
    const programme = new VenueProgram([breakSession, { ...breakSession, id: 'b-break' }], rooms);
    expect(programme.getPlannedRoomIds(['a-break', 'b-break'], new Date(breakSession.startsAt))).toEqual([
      'amphitheatre',
    ]);
  });

  it('deduplicates saved destinations and ignores sessions without a known location', () => {
    const programme = new VenueProgram(
      [talk, { ...talk, id: 'second', title: 'Second topic' }, { ...talk, id: 'unassigned', locations: [] }],
      rooms
    );
    expect(programme.getPlannedRoomIds(['talk', 'second', 'unassigned'], new Date(talk.startsAt))).toEqual(['milhaud']);
    expect(programme.getPlannedRoomIds(['unassigned', 'missing'], new Date(talk.startsAt))).toEqual([]);
  });

  it('returns the next strictly future boundary and stops refreshing after the programme', () => {
    const programme = new VenueProgram([nextTalk, talk], rooms);
    expect(programme.getNextBoundary(new Date('2026-10-15T00:00:00Z'))?.toISOString()).toBe('2026-12-10T08:55:00.000Z');
    expect(programme.getNextBoundary(new Date('2026-12-10T09:00:00Z'))?.toISOString()).toBe('2026-12-10T09:30:00.000Z');
    expect(programme.getNextBoundary(new Date('2026-12-10T09:30:00Z'))?.toISOString()).toBe('2026-12-10T09:55:00.000Z');
    expect(programme.getNextBoundary(new Date('2026-12-10T10:30:00Z'))).toBeNull();
  });

  it('tolerates empty, unknown and malformed schedule entries without showing false activity', () => {
    const programme = new VenueProgram(
      [
        { ...talk, startsAt: 'invalid' },
        { ...nextTalk, endsAt: nextTalk.startsAt },
        { ...talk, id: 'backwards', endsAt: '2026-12-10T09:00:00+01:00' },
      ],
      rooms
    );
    expect(programme.sessions).toEqual([]);
    expect(programme.getRoomState('missing')).toEqual({ sessions: [], current: [], next: [] });
    expect(programme.getNextBoundary()).toBeNull();
    expect(new VenueProgram([], rooms).getNextSavedSessions(['talk'])).toEqual([]);
  });

  it('reminds about an imminent saved session even while another saved session is running', () => {
    const programme = new VenueProgram([talk, breakSession, { ...breakSession, id: 'b-break' }, nextTalk], rooms);
    const now = new Date('2026-12-10T10:25:00+01:00');
    const saved = ['talk', 'b-break', 'next-talk'];
    expect(programme.getPlannedRoomIds(saved, now)).toEqual(['milhaud']);
    expect(programme.getStartingSoonSavedSessions(saved, now).map((session) => session.id)).toEqual(['a-break']);
    expect(programme.getStartingSoonRoomIds(saved, now)).toEqual(['amphitheatre']);
    expect(programme.getStartingSoonRoomIds(['talk', 'next-talk'], now)).toEqual([]);
    expect(programme.getStartingSoonRoomIds(saved, new Date(breakSession.startsAt))).toEqual([]);
    expect(programme.getStartingSoonRoomIds([], now)).toEqual([]);
  });

  it('reminds about all concurrent saved destinations without inventing rooms', () => {
    const other = { ...talk, id: 'other', title: 'Other topic', locations: [{ roomId: 'amphitheatre' }] };
    const unknown = { ...talk, id: 'unknown', locations: [{ roomId: 'missing' }] };
    const programme = new VenueProgram([talk, other, unknown], rooms);
    const now = new Date('2026-12-10T09:58:00+01:00');
    expect(new Set(programme.getStartingSoonRoomIds(['talk', 'other', 'unknown'], now))).toEqual(
      new Set(['milhaud', 'amphitheatre'])
    );
    expect(programme.getStartingSoonRoomIds(['unknown'], now)).toEqual([]);
  });

  it('reminds about Hallway for saved hallway sessions and only the main room for the keynote', () => {
    const programme = new VenueProgram(programSchedule.sessions, programSchedule.rooms);
    const keynote = programme.sessions.find((session) => session.format === 'keynote')!;
    const hallway = programme.getHallwayState().sessions[0];
    for (const [session, expected] of [
      [keynote, ['amphitheatre']],
      [hallway, ['hallway']],
    ] as const) {
      const now = new Date(Date.parse(session.startsAt) - 5 * 60_000);
      for (const id of session.sourceIds) {
        expect(programme.getStartingSoonRoomIds([id], now)).toEqual(expected);
      }
    }
  });
});
