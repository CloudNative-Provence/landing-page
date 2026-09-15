import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { mapScheduleToModel } from './schedule-mapper.mjs';

// Synthetic data follows the published schedule export, including proposal:null slots.
function scheduleFixture() {
  return {
    name: 'Example conference schedule',
    days: ['2026-12-10T00:00:00.000+01:00'],
    timeZone: 'Europe/Paris',
    sessions: [
      {
        id: 'slot-talk-a',
        start: '2026-12-10T10:00:00.000+01:00',
        end: '2026-12-10T10:30:00.000+01:00',
        track: 'Amphithéâtre',
        title: 'An infrastructure talk',
        language: 'FR',
        proposal: {
          id: 'proposal-a',
          abstract: 'First paragraph.\n\nSecond paragraph with "quotes" and \\slashes.',
          categories: ['AI', 'Cloud Native'],
          formats: ['Conference (30 minutes)', 'Demo'],
          speakers: [{ id: 'speaker-a', name: 'Example Speaker' }],
        },
      },
      {
        id: 'slot-talk-b',
        start: '2026-12-10T10:00:00.000+01:00',
        end: '2026-12-10T10:30:00.000+01:00',
        track: 'Atelier',
        title: 'An infrastructure talk',
        language: 'en',
        proposal: {
          id: 'proposal-b',
          abstract: 'Another proposal with the same title and category.',
          categories: ['AI'],
          formats: ['Conference (30 minutes)'],
          speakers: [{ id: 'speaker-b', name: 'Another Speaker' }],
        },
      },
      {
        id: 'slot-break-a',
        start: '2026-12-10T09:30:00.000+01:00',
        end: '2026-12-10T10:00:00.000+01:00',
        track: 'Amphithéâtre',
        title: 'Coffee',
        language: null,
        proposal: null,
      },
      {
        id: 'slot-break-b',
        start: '2026-12-10T09:30:00.000+01:00',
        end: '2026-12-10T10:00:00.000+01:00',
        track: 'Atelier',
        title: 'Coffee',
        language: null,
        proposal: null,
      },
    ],
  };
}

describe('mapScheduleToModel', () => {
  it('maps published room names to rooms with display labels and accents', () => {
    const model = mapScheduleToModel(scheduleFixture());
    assert.deepEqual(model.rooms, [
      { id: 'amphitheatre', label: 'Amphithéâtre', accent: 'from-sky-500 to-cyan-400' },
      { id: 'atelier', label: 'Atelier', accent: 'from-emerald-500 to-lime-400' },
    ]);
    assert.equal('tracks' in model, false);
    for (const session of model.sessions) {
      assert.ok(model.rooms.some((room) => room.id === session.roomId));
      assert.equal('trackId' in session, false);
    }
  });

  it('preserves full timestamps, metadata, description, speaker names, format names and tags', () => {
    const schedule = scheduleFixture();
    const model = mapScheduleToModel(schedule);
    assert.equal(model.timeZone, 'Europe/Paris');
    assert.deepEqual(model.days, schedule.days);
    assert.deepEqual(
      model.sessions.find(({ id }) => id === 'slot-talk-a'),
      {
        id: 'slot-talk-a',
        title: 'An infrastructure talk',
        description: schedule.sessions[0].proposal.abstract,
        startsAt: '2026-12-10T10:00:00.000+01:00',
        endsAt: '2026-12-10T10:30:00.000+01:00',
        roomId: 'amphitheatre',
        speakers: [{ id: 'speaker-a', name: 'Example Speaker' }],
        format: 'Conference (30 minutes) · Demo',
        tags: ['AI', 'Cloud Native', 'FR'],
      }
    );
  });

  it('preserves public speaker profiles without copying unrelated fields', () => {
    const schedule = scheduleFixture();
    const profile = {
      id: 'speaker-a',
      name: 'Example Speaker',
      bio: 'A **Markdown** biography.\n\nAnother paragraph.',
      company: 'Cloud Company',
      picture: 'https://example.org/avatar.jpg',
      socialLinks: ['https://example.org/profile', 'https://github.com/example'],
    };
    schedule.sessions[0].proposal.speakers = [{ ...profile, email: 'private@example.org' }];
    const model = mapScheduleToModel(schedule);
    assert.deepEqual(model.sessions.find(({ id }) => id === 'slot-talk-a').speakers, [profile]);
  });

  it('allows absent, null, or empty optional speaker details', () => {
    const schedule = scheduleFixture();
    schedule.sessions[0].proposal.speakers = [
      { id: 'one', name: 'First', bio: null, company: null, picture: null, socialLinks: null },
      { id: 'two', name: 'Second', bio: '', company: ' ', picture: '', socialLinks: [] },
      { id: 'three', name: 'Third' },
    ];
    const model = mapScheduleToModel(schedule);
    assert.deepEqual(model.sessions.find(({ id }) => id === 'slot-talk-a').speakers, [
      { id: 'one', name: 'First' },
      { id: 'two', name: 'Second' },
      { id: 'three', name: 'Third' },
    ]);
  });

  for (const [field, value] of [
    ['id', undefined],
    ['bio', {}],
    ['company', []],
    ['picture', 123],
    ['picture', 'javascript:alert(1)'],
    ['picture', '/local-avatar.jpg'],
    ['socialLinks', {}],
    ['socialLinks', ['javascript:alert(1)']],
  ]) {
    it(`rejects malformed speaker ${field}: ${JSON.stringify(value)}`, () => {
      const schedule = scheduleFixture();
      schedule.sessions[0].proposal.speakers[0][field] = value;
      assert.throws(() => mapScheduleToModel(schedule), /proposal.speakers\[0\]/);
    });
  }

  it('preserves custom slots and same-title sessions in different rooms without deduplicating or marking them global', () => {
    const { sessions } = mapScheduleToModel(scheduleFixture());
    assert.equal(sessions.length, 4);
    assert.equal(new Set(sessions.map(({ id }) => id)).size, 4);
    assert.deepEqual(sessions[0], {
      id: 'slot-break-a',
      title: 'Coffee',
      description: '',
      startsAt: '2026-12-10T09:30:00.000+01:00',
      endsAt: '2026-12-10T10:00:00.000+01:00',
      roomId: 'amphitheatre',
    });
    assert.equal(sessions[1].id, 'slot-break-b');
    assert.ok(sessions.every((session) => !('isGlobal' in session)));
  });

  it('keeps source session IDs when a title changes or a proposal appears in multiple slots', () => {
    const schedule = scheduleFixture();
    schedule.sessions[0].title = 'Updated title';
    schedule.sessions[1].proposal = schedule.sessions[0].proposal;
    const { sessions } = mapScheduleToModel(schedule);
    assert.deepEqual(
      sessions.filter(({ title }) => title !== 'Coffee').map(({ id }) => id),
      ['slot-talk-a', 'slot-talk-b']
    );
  });

  it('sorts rooms and sessions deterministically regardless of API array order', () => {
    const schedule = scheduleFixture();
    const original = structuredClone(schedule);
    const model = mapScheduleToModel(schedule);
    assert.deepEqual(schedule, original, 'mapping must not mutate the export');
    assert.deepEqual(
      model.sessions.map(({ id }) => id),
      ['slot-break-a', 'slot-break-b', 'slot-talk-a', 'slot-talk-b']
    );
    schedule.sessions.reverse();
    assert.deepEqual(mapScheduleToModel(schedule), model);
  });

  it('orders by timestamp instant across offsets and days, with source ID as a stable tie-breaker', () => {
    const schedule = scheduleFixture();
    const base = schedule.sessions[2];
    schedule.days.push('2026-12-11T00:00:00.000+01:00');
    schedule.sessions = [
      { ...base, id: 'next-day', start: '2026-12-11T08:00:00+01:00', end: '2026-12-11T09:00:00+01:00' },
      { ...base, id: 'same-instant-z', start: '2026-12-10T09:00:00Z', end: '2026-12-10T09:30:00Z' },
      { ...base, id: 'same-instant-a', start: '2026-12-10T10:00:00+01:00', end: '2026-12-10T10:30:00+01:00' },
      { ...base, id: 'earliest', start: '2026-12-10T10:30:00+02:00', end: '2026-12-10T11:00:00+02:00' },
    ];
    const model = mapScheduleToModel(schedule);
    assert.deepEqual(
      model.sessions.map(({ id }) => id),
      ['earliest', 'same-instant-a', 'same-instant-z', 'next-day']
    );
    assert.equal(model.sessions[3].startsAt, '2026-12-11T08:00:00+01:00');
    assert.deepEqual(model.days, schedule.days);
  });

  it('does not require proposal categories to place a talk in a room', () => {
    const schedule = scheduleFixture();
    schedule.sessions[0].proposal = { abstract: null, categories: [], formats: [], speakers: [] };
    schedule.sessions[0].language = null;
    const mapped = mapScheduleToModel(schedule).sessions.find(({ id }) => id === 'slot-talk-a');
    assert.equal(mapped.roomId, 'amphitheatre');
    assert.equal(mapped.description, '');
    assert.equal(mapped.format, undefined);
    assert.equal(mapped.tags, undefined);
    assert.equal(mapped.speakers, undefined);
  });

  for (const value of [null, [], {}, { talks: [] }, { sessions: [] }, { sessions: {} }]) {
    it(`rejects an empty or wrong export shape: ${JSON.stringify(value)}`, () => {
      assert.throws(() => mapScheduleToModel(value), /nonempty sessions array/);
    });
  }

  for (const [field, value, error] of [
    ['timeZone', undefined, /timeZone must be/],
    ['timeZone', 'Invalid\/Timezone', /unknown timeZone/],
    ['days', [], /days must be/],
    ['days', undefined, /days must be/],
    ['days', ['2026-12-10'], /days\[0\].*ISO timestamp/],
    ['days', ['2026-02-30T00:00:00+01:00'], /days\[0\].*ISO timestamp/],
  ]) {
    it(`rejects invalid ${field} metadata: ${JSON.stringify(value)}`, () => {
      const schedule = scheduleFixture();
      schedule[field] = value;
      assert.throws(() => mapScheduleToModel(schedule), error);
    });
  }

  for (const [field, value, error] of [
    ['id', '', /\.id must be/],
    ['title', '  ', /\.title must be/],
    ['track', null, /\.track must be/],
    ['track', '☁️', /no usable identifier/],
    ['start', '2026-12-10T10:00:00', /\.start.*ISO timestamp/],
    ['start', '2026-12-10T24:00:00Z', /\.start.*ISO timestamp/],
    ['start', 'invalid', /\.start.*ISO timestamp/],
    ['end', '2026-12-10T10:00:00.000+01:00', /end must be after start/],
    ['end', '2026-12-10T09:00:00.000+01:00', /end must be after start/],
    ['proposal', undefined, /proposal must be an object or null/],
    ['language', 123, /language must be/],
  ]) {
    it(`rejects malformed slot ${field}: ${JSON.stringify(value)}`, () => {
      const schedule = scheduleFixture();
      schedule.sessions[0][field] = value;
      assert.throws(() => mapScheduleToModel(schedule), error);
    });
  }

  it('rejects duplicate source IDs', () => {
    const schedule = scheduleFixture();
    schedule.sessions[1].id = schedule.sessions[0].id;
    assert.throws(() => mapScheduleToModel(schedule), /duplicate session ID/);
  });

  it('rejects distinct room names that collapse to the same slug', () => {
    const schedule = scheduleFixture();
    schedule.sessions[1].track = 'Amphitheatre';
    assert.throws(() => mapScheduleToModel(schedule), /share identifier "amphitheatre"/);
  });

  for (const [field, value, error] of [
    ['abstract', {}, /abstract must be a string/],
    ['categories', 'AI', /categories must be an array/],
    ['categories', [{}], /categories\[0\] must be a nonempty string/],
    ['formats', {}, /formats must be an array/],
    ['speakers', {}, /speakers must be an array/],
    ['speakers', [{ displayName: 'Old API name' }], /speakers\[0\].name must be a nonempty string/],
  ]) {
    it(`rejects malformed proposal ${field}: ${JSON.stringify(value)}`, () => {
      const schedule = scheduleFixture();
      schedule.sessions[0].proposal[field] = value;
      assert.throws(() => mapScheduleToModel(schedule), error);
    });
  }
});
