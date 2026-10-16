import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AppClock } from './app-clock';
import { DevelopmentClockConsole } from './dev-clock';

const realTime = Date.parse('2026-10-16T10:00:00Z');
const fakeTime = Date.parse('2026-12-10T12:30:00+01:00');
let values: Map<string, string>;

function createWindow() {
  return Object.assign(new EventTarget(), {
    localStorage: {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
      removeItem: (key: string) => values.delete(key),
    },
  });
}

beforeEach(() => {
  vi.stubEnv('DEV', true);
  vi.useFakeTimers();
  vi.setSystemTime(realTime);
  values = new Map();
  vi.stubGlobal('window', createWindow());
  AppClock.setDevelopmentOffset(0);
});

afterEach(() => {
  vi.stubEnv('DEV', true);
  AppClock.setDevelopmentOffset(0);
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe('development clock console', () => {
  it('shifts the application clock, keeps it ticking and refreshes consumers without replacing native Date', () => {
    const originalDate = Date;
    const refresh = vi.fn();
    window.addEventListener(AppClock.changeEvent, refresh);
    const clock = DevelopmentClockConsole.install()!;

    expect(clock.active).toBe(false);
    expect(clock.set('2026-12-10T12:30:00+01:00').getTime()).toBe(fakeTime);
    expect(clock.active).toBe(true);
    expect(clock.now().getTime()).toBe(fakeTime);
    expect(AppClock.timestamp()).toBe(fakeTime);
    expect(refresh).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(5_000);
    expect(clock.now().getTime()).toBe(fakeTime + 5_000);
    expect(Date).toBe(originalDate);
    expect(Date.now()).toBe(realTime + 5_000);
    expect(new Date().getTime()).toBe(realTime + 5_000);

    expect(clock.reset().getTime()).toBe(realTime + 5_000);
    expect(clock.active).toBe(false);
    expect(AppClock.now().getTime()).toBe(realTime + 5_000);
    expect(values.size).toBe(0);
    expect(refresh).toHaveBeenCalledTimes(2);
  });

  it('persists the ticking offset in local storage and restores it in a new browser session', () => {
    DevelopmentClockConsole.install()!.set('2026-12-10T12:30+01:00');
    expect(window.localStorage.getItem('cnp-dev-clock-offset')).toBe(String(fakeTime - realTime));
    vi.advanceTimersByTime(3_600_000);
    AppClock.setDevelopmentOffset(0);
    vi.stubGlobal('window', createWindow());
    const restored = DevelopmentClockConsole.install()!;
    expect(restored.active).toBe(true);
    expect(restored.now().getTime()).toBe(fakeTime + 3_600_000);
    expect(DevelopmentClockConsole.install()).toBe(restored);
  });

  it('clears the persisted override on reset so a new page uses real time', () => {
    const clock = DevelopmentClockConsole.install()!;
    clock.set('2026-12-10T12:30+01:00');
    clock.reset();
    expect(window.localStorage.getItem('cnp-dev-clock-offset')).toBeNull();

    vi.stubGlobal('window', createWindow());
    const restored = DevelopmentClockConsole.install()!;
    expect(restored.active).toBe(false);
    expect(restored.now().getTime()).toBe(realTime);
  });

  it('updates consumers immediately when another tab sets, resets or clears the simulated clock', () => {
    const clock = DevelopmentClockConsole.install()!;
    const states: { active: boolean; time: number }[] = [];
    window.addEventListener(AppClock.changeEvent, () =>
      states.push({ active: clock.active, time: clock.now().getTime() })
    );
    DevelopmentClockConsole.install();
    const receive = (key: string | null, newValue: string | null) => {
      if (key === null) values.clear();
      else if (newValue === null) values.delete(key);
      else values.set(key, newValue);
      window.dispatchEvent(Object.assign(new Event('storage'), { key, newValue, storageArea: window.localStorage }));
    };

    receive('cnp-dev-clock-offset', String(fakeTime - realTime));
    expect(clock.now().getTime()).toBe(fakeTime);
    receive('cnp-dev-clock-offset', null);
    expect(clock.now().getTime()).toBe(realTime);
    receive('cnp-dev-clock-offset', '0');
    expect(clock.active).toBe(true);
    receive(null, null);
    expect(clock.active).toBe(false);
    expect(states).toEqual([
      { active: true, time: fakeTime },
      { active: false, time: realTime },
      { active: true, time: realTime },
      { active: false, time: realTime },
    ]);
  });

  it('ignores unrelated keys and storage areas when synchronizing time', () => {
    const clock = DevelopmentClockConsole.install()!;
    clock.set('2026-12-10T12:30+01:00');
    const refresh = vi.fn();
    window.addEventListener(AppClock.changeEvent, refresh);
    for (const change of [
      { key: 'cnp-program-selection', newValue: '0', storageArea: window.localStorage },
      { key: 'cnp-dev-clock-offset', newValue: '0', storageArea: {} },
    ])
      window.dispatchEvent(Object.assign(new Event('storage'), change));
    expect(clock.now().getTime()).toBe(fakeTime);
    expect(refresh).not.toHaveBeenCalled();
  });

  it('returns to real time if another tab stores an invalid offset', () => {
    const clock = DevelopmentClockConsole.install()!;
    clock.set('2026-12-10T12:30+01:00');
    values.set('cnp-dev-clock-offset', 'invalid');
    window.dispatchEvent(
      Object.assign(new Event('storage'), {
        key: 'cnp-dev-clock-offset',
        newValue: 'invalid',
        storageArea: window.localStorage,
      })
    );
    expect(clock.active).toBe(false);
    expect(clock.now().getTime()).toBe(realTime);
    expect(values.size).toBe(0);
  });

  it('uses the latest persisted time when delayed storage events arrive', () => {
    const clock = DevelopmentClockConsole.install()!;
    values.set('cnp-dev-clock-offset', String(fakeTime - realTime));
    window.dispatchEvent(
      Object.assign(new Event('storage'), {
        key: 'cnp-dev-clock-offset',
        newValue: '0',
        storageArea: window.localStorage,
      })
    );
    expect(clock.active).toBe(true);
    expect(clock.now().getTime()).toBe(fakeTime);
  });

  it.each([
    'invalid',
    '',
    '2026-12-10',
    '2026-12-10T12:30',
    '2026-02-30T12:00:00Z',
    '2026-12-10T24:00:00Z',
    '2026-13-10T12:00:00Z',
    '2026-12-10T12:99:00Z',
    null,
    123,
  ])('rejects ambiguous or invalid input without changing the current clock: %j', (input) => {
    const clock = DevelopmentClockConsole.install()!;
    clock.set('2026-12-10T12:30:00+01:00');
    const stored = [...values];
    expect(() => clock.set(input as string)).toThrow(/ISO date and time with a timezone/);
    expect(clock.now().getTime()).toBe(fakeTime);
    expect([...values]).toEqual(stored);
  });

  it('accepts UTC and supports rewinding the clock', () => {
    const clock = DevelopmentClockConsole.install()!;
    expect(clock.set('2026-05-01T12:00:00.123Z').toISOString()).toBe('2026-05-01T12:00:00.123Z');
  });

  it.each(['', 'not-a-number', 'Infinity', '1e100'])('discards invalid stored offsets: %j', (stored) => {
    DevelopmentClockConsole.install()!.set('2026-12-10T12:30+01:00');
    const key = [...values.keys()][0];
    values.set(key, stored);
    AppClock.setDevelopmentOffset(0);
    vi.stubGlobal('window', createWindow());
    const clock = DevelopmentClockConsole.install()!;
    expect(clock.now().getTime()).toBe(realTime);
    expect(clock.active).toBe(false);
    expect(values.size).toBe(0);
  });

  it('works in memory when local storage is unavailable', () => {
    for (const method of ['getItem', 'setItem', 'removeItem'] as const) {
      vi.spyOn(window.localStorage, method).mockImplementation(() => {
        throw new Error('Storage unavailable');
      });
    }
    const clock = DevelopmentClockConsole.install()!;
    expect(clock.set('2026-12-10T12:30:00+01:00').getTime()).toBe(fakeTime);
    expect(clock.active).toBe(true);
    expect(clock.reset().getTime()).toBe(realTime);
    expect(clock.active).toBe(false);
  });

  it('publishes the active state before notifying the UI, even for a zero offset', () => {
    const clock = DevelopmentClockConsole.install()!;
    const states: boolean[] = [];
    window.addEventListener(AppClock.changeEvent, () => states.push(clock.active));

    clock.set(new Date(realTime).toISOString());
    expect(clock.active).toBe(true);
    clock.reset();

    expect(states).toEqual([true, false]);
  });

  it('does not expose or override a production clock', () => {
    vi.stubEnv('DEV', false);
    expect(DevelopmentClockConsole.install()).toBeUndefined();
    AppClock.setDevelopmentOffset(fakeTime - realTime);
    expect(window.devClock).toBeUndefined();
    expect(AppClock.timestamp()).toBe(realTime);
  });

  it('does not install console controls during server rendering', () => {
    vi.stubGlobal('window', undefined);
    expect(DevelopmentClockConsole.install()).toBeUndefined();
    AppClock.setDevelopmentOffset(fakeTime - realTime);
    expect(AppClock.timestamp()).toBe(realTime);
  });
});
