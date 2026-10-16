import { describe, expect, it } from 'vitest';
import { EventDay } from './event-day';

describe('event day', () => {
  const day = new EventDay('2026-12-10T08:00:00+01:00', 'Europe/Paris');

  it.each([
    ['2026-12-09T22:59:59.999Z', false],
    ['2026-12-09T23:00:00Z', true],
    ['2026-12-10T07:00:00Z', true],
    ['2026-12-10T22:59:59.999Z', true],
    ['2026-12-10T23:00:00Z', false],
  ])('uses the whole local calendar day at %s', (instant, expected) => {
    expect(day.includes(new Date(instant))).toBe(expected);
  });

  it('uses the configured timezone even when its date differs from the timestamp date', () => {
    const summerDay = new EventDay('2026-06-09T23:00:00Z', 'Europe/Paris');
    expect(summerDay.includes(new Date('2026-06-09T21:59:59Z'))).toBe(false);
    expect(summerDay.includes(new Date('2026-06-09T22:00:00Z'))).toBe(true);
    expect(summerDay.includes(new Date('2026-06-10T22:00:00Z'))).toBe(false);
  });

  it('rejects invalid configuration and does not match an invalid clock value', () => {
    expect(() => new EventDay('invalid', 'Europe/Paris')).toThrow(RangeError);
    expect(() => new EventDay('2026-12-10T08:00:00Z', 'invalid')).toThrow(RangeError);
    expect(day.includes(new Date('invalid'))).toBe(false);
  });
});
