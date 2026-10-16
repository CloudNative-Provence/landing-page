import { describe, expect, it } from 'vitest';
import { ZonedDateTimeInput } from './zoned-date-time-input';

describe('simulated time input', () => {
  const paris = new ZonedDateTimeInput('Europe/Paris');

  it.each([
    ['2026-12-10T12:30', '2026-12-10T11:30:00.000Z'],
    ['2026-07-10T12:30', '2026-07-10T10:30:00.000Z'],
    ['2026-12-10T00:00', '2026-12-09T23:00:00.000Z'],
    ['2028-02-29T09:15', '2028-02-29T08:15:00.000Z'],
  ])('round trips %s in the event timezone', (local, instant) => {
    expect(paris.toInput(new Date(instant))).toBe(local);
    expect(paris.toInstant(local)?.toISOString()).toBe(instant);
  });

  it.each(['', 'invalid', '2026-02-29T12:00', '2026-12-10T24:00', '2026-12-10T12:99', '2026-03-29T02:30'])(
    'rejects invalid or nonexistent local times: %s',
    (value) => {
      expect(paris.toInstant(value)).toBeNull();
    }
  );

  it('chooses the first occurrence of a repeated autumn time', () => {
    expect(paris.toInstant('2026-10-25T02:30')?.toISOString()).toBe('2026-10-25T00:30:00.000Z');
  });

  it('supports fractional timezone offsets', () => {
    const kathmandu = new ZonedDateTimeInput('Asia/Kathmandu');
    expect(kathmandu.toInstant('2026-12-10T12:30')?.toISOString()).toBe('2026-12-10T06:45:00.000Z');
  });

  it.each(['0001-01-01T00:00', '9999-12-31T23:59'])('supports the input year boundaries: %s', (value) => {
    const instant = paris.toInstant(value);
    expect(instant).not.toBeNull();
    expect(paris.toInput(instant!)).toBe(value);
  });
});
