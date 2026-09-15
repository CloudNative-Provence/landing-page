import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { mapEventToScheduleModel } from './schedule-mapper.mjs';

const noopLogger = { warning: () => {} };

describe('mapEventToScheduleModel', () => {
  /** @type {import('./conference-hall-client.mjs').ConferenceHallEvent} */
  const event = {
    id: 'kcd-provence-2026',
    name: 'KCD Provence 2026',
    categories: [
      { id: 'cat1', name: 'Keynote' },
      { id: 'cat2', name: 'Platform' },
    ],
    formats: [{ id: 'fmt1', name: 'Talk · 30 min' }],
    talks: [
      {
        uid: 'talk1',
        title: 'Opening keynote',
        abstract: 'Welcome.',
        categories: 'cat1',
        formats: 'fmt1',
        language: 'en',
        speakers: [{ uid: 's1', displayName: 'Alice' }],
      },
    ],
    schedule: {
      rooms: [{ id: 'room1', name: 'Grand Auditorium' }],
      sessions: [
        {
          talkId: 'talk1',
          roomId: 'room1',
          startTime: '2026-12-10T09:00:00+01:00',
          endTime: '2026-12-10T09:40:00+01:00',
        },
      ],
    },
  };

  it('maps categories to tracks with roomId (no accent)', () => {
    const { tracks } = mapEventToScheduleModel(event, noopLogger);
    assert.equal(tracks.length, 2);
    assert.equal(tracks[0].id, 'keynote');
    assert.equal(tracks[0].label, 'Keynote');
    assert.equal(tracks[0].roomId, 'grand-auditorium');
    assert.equal(tracks[0].accent, undefined);
  });

  it('maps rooms', () => {
    const { rooms } = mapEventToScheduleModel(event, noopLogger);
    assert.equal(rooms.length, 1);
    assert.equal(rooms[0].id, 'grand-auditorium');
    assert.equal(rooms[0].label, 'Grand Auditorium');
  });

  it('maps scheduled sessions with preserved local time; room is track concern', () => {
    const { sessions } = mapEventToScheduleModel(event, noopLogger);
    assert.equal(sessions.length, 1);
    const s = sessions[0];
    assert.equal(s.id, 'opening-keynote');
    assert.equal(s.title, 'Opening keynote');
    assert.equal(s.startsAtTime, '09:00');
    assert.equal(s.endsAtTime, '09:40');
    assert.deepEqual(s.trackIds, ['keynote']);
    assert.equal(s.roomIds, undefined);
    assert.deepEqual(s.speakers, ['Alice']);
    assert.equal(s.format, 'Talk · 30 min');
    assert.deepEqual(s.tags, ['keynote', 'en']);
  });

  it('sorts sessions by start time', () => {
    const eventWithTwo = {
      ...event,
      talks: [
        ...event.talks,
        {
          uid: 'talk2',
          title: 'Later talk',
          abstract: '',
          categories: 'cat2',
          formats: 'fmt1',
          language: 'fr',
          speakers: [],
        },
      ],
      schedule: {
        rooms: event.schedule.rooms,
        sessions: [
          { talkId: 'talk2', roomId: 'room1', startTime: '2026-12-10T10:00:00+01:00', endTime: '2026-12-10T10:30:00+01:00' },
          { talkId: 'talk1', roomId: 'room1', startTime: '2026-12-10T09:00:00+01:00', endTime: '2026-12-10T09:40:00+01:00' },
        ],
      },
    };

    const { sessions } = mapEventToScheduleModel(eventWithTwo, noopLogger);
    assert.equal(sessions[0].startsAtTime, '09:00');
    assert.equal(sessions[1].startsAtTime, '10:00');
  });

  it('falls back to placeholder times when no schedule is present', () => {
    const warnings = [];
    const logger = { warning: (msg) => warnings.push(msg) };

    const eventNoSchedule = { ...event, schedule: undefined };
    const { sessions } = mapEventToScheduleModel(eventNoSchedule, logger);

    assert.equal(sessions.length, 1);
    assert.equal(sessions[0].startsAtTime, '00:00');
    assert.equal(warnings.length, 1);
    assert.match(warnings[0], /No schedule data/);
  });

  it('skips unknown talkIds in schedule slots', () => {
    const eventWithUnknown = {
      ...event,
      schedule: {
        rooms: event.schedule.rooms,
        sessions: [
          { talkId: 'unknown-id', roomId: 'room1', startTime: '2026-12-10T09:00:00+01:00', endTime: '2026-12-10T09:30:00+01:00' },
        ],
      },
    };

    const { sessions } = mapEventToScheduleModel(eventWithUnknown, noopLogger);
    assert.equal(sessions.length, 0);
  });

  it('throws when a scheduled talk has no category (track)', () => {
    const eventNoCategory = {
      ...event,
      talks: [
        { ...event.talks[0], categories: undefined },
      ],
    };

    assert.throws(
      () => mapEventToScheduleModel(eventNoCategory, noopLogger),
      /has no related track/
    );
  });
});
