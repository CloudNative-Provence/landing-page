import { AppClock } from './app-clock';

export interface DevelopmentClock {
  readonly active: boolean;
  /** Start a ticking clock at an ISO date and time with an explicit timezone. */
  set(instant: string): Date;
  now(): Date;
  reset(): Date;
}

declare global {
  interface Window {
    devClock?: DevelopmentClock;
  }
}

/** Dev-only console controls, with the ticking offset persisted in local storage. */
export class DevelopmentClockConsole {
  private static readonly storageKey = 'cnp-dev-clock-offset';

  static install(): DevelopmentClock | undefined {
    if (!import.meta.env.DEV || typeof window === 'undefined') return;
    if (window.devClock) return window.devClock;

    let active = false;

    const persist = (offset: number | null) => {
      try {
        if (offset === null) window.localStorage.removeItem(this.storageKey);
        else window.localStorage.setItem(this.storageKey, String(offset));
      } catch {
        // Keep this document's clock usable if browser storage is unavailable.
      }
    };
    const restore = (stored: string | null) => {
      try {
        if (stored !== null && !stored.trim()) throw new RangeError('Empty clock offset.');
        active = stored !== null;
        AppClock.setDevelopmentOffset(stored === null ? 0 : Number(stored));
      } catch {
        active = false;
        persist(null);
        AppClock.setDevelopmentOffset(0);
      }
    };
    const clock: DevelopmentClock = Object.freeze({
      get active() {
        return active;
      },
      set: (instant: string) => {
        const timestamp = this.parseInstant(instant);
        const offset = timestamp - Date.now();
        persist(offset);
        active = true;
        AppClock.setDevelopmentOffset(offset);
        return AppClock.now();
      },
      now: () => AppClock.now(),
      reset: () => {
        persist(null);
        active = false;
        AppClock.setDevelopmentOffset(0);
        return AppClock.now();
      },
    });
    window.devClock = clock;
    try {
      const stored = window.localStorage.getItem(this.storageKey);
      if (stored !== null) restore(stored);
    } catch {
      active = false;
      persist(null);
    }
    // One listener per window: install() returns the existing console on page navigation.
    window.addEventListener('storage', (event) => {
      if (event.key !== null && event.key !== this.storageKey) return;
      try {
        if (event.storageArea && event.storageArea !== window.localStorage) return;
        // Read the latest value in case several updates queued while this tab was hidden.
        restore(window.localStorage.getItem(this.storageKey));
      } catch {
        // Retain this document's clock if storage has become unavailable.
      }
    });
    return clock;
  }

  private static parseInstant(instant: string): number {
    const timestamp = typeof instant === 'string' ? Date.parse(instant) : Number.NaN;
    if (
      typeof instant !== 'string' ||
      !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d{1,3})?)?(?:Z|[+-]\d{2}:\d{2})$/.test(instant) ||
      !Number.isFinite(timestamp) ||
      Number(instant.slice(11, 13)) > 23 ||
      new Date(`${instant.slice(0, 10)}T00:00:00Z`).toISOString().slice(0, 10) !== instant.slice(0, 10)
    ) {
      throw new RangeError('Use an ISO date and time with a timezone, e.g. devClock.set("2026-12-10T12:30:00+01:00").');
    }
    return timestamp;
  }
}
