import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { assignSessionLocations } from './session-locations-mapper.mjs';
import { mapRooms } from './rooms-mapper.mjs';

const rooms = mapRooms([{ track: 'Amphithéâtre' }, { track: 'Salle Milhaud' }, { track: 'Hallway' }]);
const talk = {
  id: 'a',
  locations: [{ roomId: 'amphitheatre' }],
  title: 'A session',
  description: '',
  startsAt: '2026-12-10T09:00:00+01:00',
  endsAt: '2026-12-10T09:30:00+01:00',
  format: 'Keynote',
};
const broadcast = { ...talk, id: 'b', locations: [{ roomId: 'salle-milhaud' }] };
const hallwayLocations = [{ roomId: 'hallway' }];

describe('generated session locations', () => {
  it('assigns the main room and broadcasts when a formatted session covers every conference room', () => {
    const source = [talk, broadcast];
    const original = structuredClone(source);
    for (const session of assignSessionLocations(source, rooms)) {
      assert.equal(Object.hasOwn(session, 'roomId'), false);
      assert.deepEqual(session.locations, [
        { roomId: 'amphitheatre', role: 'main' },
        { roomId: 'salle-milhaud', role: 'broadcast' },
      ]);
    }
    assert.deepEqual(source, original);
    assert.deepEqual(
      assignSessionLocations(source, rooms).map((session) => session.id),
      ['a', 'b']
    );
  });

  it('uses configured room roles rather than names or array order', () => {
    const configured = rooms.map((room) => ({ ...room, isMain: room.id === 'salle-milhaud' })).reverse();
    assert.deepEqual(assignSessionLocations([broadcast, talk], configured)[0].locations, [
      { roomId: 'salle-milhaud', role: 'main' },
      { roomId: 'amphitheatre', role: 'broadcast' },
    ]);
  });

  for (const format of [undefined, '', '  ', 'Keynote']) {
    it(`keeps conference destinations and broadcast roles regardless of format (${JSON.stringify(format)})`, () => {
      assert.deepEqual(assignSessionLocations([{ ...talk, format }], rooms)[0].locations, talk.locations);
      for (const session of assignSessionLocations(
        [
          { ...talk, format },
          { ...broadcast, format },
        ],
        rooms
      )) {
        assert.deepEqual(session.locations, [
          { roomId: 'amphitheatre', role: 'main' },
          { roomId: 'salle-milhaud', role: 'broadcast' },
        ]);
      }
    });
  }

  it('preserves hallway destinations when the same activity also appears in every conference room', () => {
    const hallway = { ...talk, id: 'hallway', locations: hallwayLocations };
    const mapped = assignSessionLocations([talk, hallway, broadcast], rooms);
    assert.deepEqual(mapped[1].locations, hallwayLocations);
    for (const session of [mapped[0], mapped[2]]) {
      assert.deepEqual(session.locations, [
        { roomId: 'amphitheatre', role: 'main' },
        { roomId: 'salle-milhaud', role: 'broadcast' },
      ]);
    }
  });

  it('keeps single-room talks and partial matches in their published rooms', () => {
    assert.deepEqual(assignSessionLocations([talk], rooms)[0].locations, [{ roomId: 'amphitheatre' }]);
    const expanded = [...rooms, { id: 'third', label: 'Third', kind: 'conference' }];
    assert.deepEqual(
      assignSessionLocations([talk, broadcast], expanded).map((session) => session.locations),
      [[{ roomId: 'amphitheatre' }], [{ roomId: 'salle-milhaud' }]]
    );
  });

  it('does not broadcast unrelated concurrent talks or invent a missing main room', () => {
    assert.deepEqual(assignSessionLocations([talk, { ...broadcast, title: 'Another session' }], rooms)[0].locations, [
      { roomId: 'amphitheatre' },
    ]);
    const unconfigured = rooms.map((room) => ({ ...room, isMain: false }));
    assert(
      assignSessionLocations([talk, broadcast], unconfigured).every((session) =>
        session.locations.every((location) => !location.role)
      )
    );
  });

  it('does not mistake duplicate source entries in one room for coverage of every room', () => {
    for (const source of [
      [talk, { ...talk, id: 'duplicate' }],
      [talk, broadcast, { ...talk, id: 'duplicate' }],
    ]) {
      const mapped = assignSessionLocations(source, rooms);
      assert.deepEqual(
        mapped.map((session) => session.locations),
        source.map((session) => session.locations)
      );
      assert.deepEqual(
        mapped.map((session) => session.id),
        source.map((session) => session.id)
      );
    }
  });

  it('keeps each published track as one room without adding physical plan spaces', () => {
    assert.deepEqual(
      rooms.map((room) => room.id),
      ['amphitheatre', 'hallway', 'salle-milhaud']
    );
    assert.equal(rooms.find((room) => room.id === 'hallway').kind, 'hallway');
    assert.deepEqual(
      mapRooms([{ track: 'Amphithéâtre' }]).map((room) => room.id),
      ['amphitheatre']
    );
    assert(rooms.every((room) => !Object.hasOwn(room, 'venueRoomId')));
  });
});
