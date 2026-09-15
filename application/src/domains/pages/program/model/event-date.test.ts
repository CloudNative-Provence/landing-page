import { describe, expect, it } from 'vitest';
import { assertScheduleMatchesEvent } from './event-date';

const event = { startsAt: '2026-12-10T08:00:00+01:00', timeZone: 'Europe/Paris' };
const schedule = {
  days: ['2026-12-10T00:00:00+01:00'],
  sessions: [{ id: 'talk', startsAt: '2026-12-10T09:00:00+01:00', endsAt: '2026-12-10T10:00:00+01:00' }],
};

describe('configured event date', () => {
  it('accepts different session times on the configured day', () => {
    expect(() => assertScheduleMatchesEvent(schedule, event)).not.toThrow();
  });

  it('compares calendar dates in the configured timezone, including UTC on the previous date', () => {
    expect(() =>
      assertScheduleMatchesEvent(
        {
          days: ['2026-12-09T23:00:00Z'],
          sessions: [{ id: 'early', startsAt: '2026-12-09T23:15:00Z', endsAt: '2026-12-10T00:00:00Z' }],
        },
        event
      )
    ).not.toThrow();
  });

  it('rejects a different published day or an additional day', () => {
    expect(() => assertScheduleMatchesEvent({ ...schedule, days: ['2026-12-11T00:00:00+01:00'] }, event)).toThrow(
      /schedule.days\[0\].*2026-12-11.*2026-12-10/
    );
    expect(() =>
      assertScheduleMatchesEvent({ ...schedule, days: [...schedule.days, '2026-12-11T00:00:00+01:00'] }, event)
    ).toThrow(/schedule.days\[1\]/);
  });

  it('rejects session dates even without duplicated schedule metadata', () => {
    expect(() =>
      assertScheduleMatchesEvent(
        {
          sessions: [{ ...schedule.sessions[0], startsAt: '2026-12-09T09:00:00+01:00' }],
        },
        event
      )
    ).toThrow(/session "talk" start.*2026-12-09.*2026-12-10/);
  });

  it('rejects a session crossing into another event date', () => {
    expect(() =>
      assertScheduleMatchesEvent(
        {
          ...schedule,
          sessions: [{ ...schedule.sessions[0], endsAt: '2026-12-11T00:15:00+01:00' }],
        },
        event
      )
    ).toThrow(/session "talk" end.*2026-12-11.*2026-12-10/);
  });

  it('uses the configured timezone rather than a raw timestamp date prefix', () => {
    expect(() =>
      assertScheduleMatchesEvent(
        {
          sessions: [{ id: 'late', startsAt: '2026-12-10T23:30:00Z', endsAt: '2026-12-10T23:45:00Z' }],
        },
        event
      )
    ).toThrow(/2026-12-11/);
  });

  it('rejects missing offsets or invalid configuration instead of using the machine timezone', () => {
    expect(() => assertScheduleMatchesEvent(schedule, { ...event, startsAt: '2026-12-10T08:00:00' })).toThrow(
      /event.startsAt/
    );
    expect(() => assertScheduleMatchesEvent(schedule, { ...event, timeZone: 'Invalid/Zone' })).toThrow(
      /event.timeZone/
    );
  });
});
