import { describe, expect, it } from 'vitest';
import { ProgramSessionReminder } from './session-reminder';

const session = { startsAt: '2026-12-10T10:00:00+01:00', endsAt: '2026-12-10T10:30:00+01:00' };

describe('ProgramSessionReminder', () => {
  it.each([
    ['2026-12-10T08:54:59.999Z', false],
    ['2026-12-10T08:55:00Z', true],
    ['2026-12-10T08:59:59.999Z', true],
    ['2026-12-10T09:00:00Z', false],
    ['2026-12-10T09:30:00Z', false],
  ])('limits reminders to the five minutes before the start (%s)', (time, expected) => {
    expect(ProgramSessionReminder.isStartingSoon(session, new Date(time))).toBe(expected);
  });

  it('ignores invalid, empty and backwards intervals', () => {
    const malformed = [
      { ...session, startsAt: 'invalid' },
      { ...session, endsAt: 'invalid' },
      { ...session, endsAt: session.startsAt },
      { ...session, endsAt: '2026-12-10T09:00:00+01:00' },
    ];
    const now = new Date('2026-12-10T08:58:00Z');
    for (const interval of malformed) expect(ProgramSessionReminder.isStartingSoon(interval, now)).toBe(false);
    expect(ProgramSessionReminder.isStartingSoon(session, new Date('invalid'))).toBe(false);
    expect(ProgramSessionReminder.getNextBoundary(malformed, now)).toBeNull();
    expect(ProgramSessionReminder.getNextBoundary([], now)).toBeNull();
  });

  it('schedules exact reminder, start and end transitions, then stops', () => {
    for (const [time, expected] of [
      ['2026-12-09T00:00:00Z', '2026-12-10T08:55:00.000Z'],
      ['2026-12-10T08:55:00Z', '2026-12-10T09:00:00.000Z'],
      ['2026-12-10T09:00:00Z', '2026-12-10T09:30:00.000Z'],
    ]) {
      expect(ProgramSessionReminder.getNextBoundary([session], new Date(time))?.toISOString()).toBe(expected);
    }
    expect(ProgramSessionReminder.getNextBoundary([session], new Date(session.endsAt))).toBeNull();
  });
});
