import { AppClock } from '~/shared/time/app-clock';

type SessionInterval = { startsAt: string; endsAt: string };

/** Shared reminder window for saved sessions on the programme and venue map. */
export class ProgramSessionReminder {
  static readonly leadTimeMs = 5 * 60_000;

  static isStartingSoon(session: SessionInterval, now: Date = AppClock.now()): boolean {
    const start = Date.parse(session.startsAt);
    const end = Date.parse(session.endsAt);
    const remaining = start - now.getTime();
    return (
      Number.isFinite(start) && Number.isFinite(end) && end > start && remaining > 0 && remaining <= this.leadTimeMs
    );
  }

  /** Include reminder, start and end boundaries so neither view needs to poll. */
  static getNextBoundary(sessions: readonly SessionInterval[], now: Date = AppClock.now()): Date | null {
    let next = Infinity;
    for (const session of sessions) {
      const start = Date.parse(session.startsAt);
      const end = Date.parse(session.endsAt);
      if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) continue;
      for (const boundary of [start - this.leadTimeMs, start, end]) {
        if (boundary > now.getTime()) next = Math.min(next, boundary);
      }
    }
    return Number.isFinite(next) ? new Date(next) : null;
  }
}
