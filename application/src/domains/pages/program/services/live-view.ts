export type ProgramLiveState = 'past' | 'live' | 'upcoming';

export class ProgramLiveView {
  static readonly liveParam = 'live';

  static isEnabled(value: string | null | undefined): boolean {
    return value === 'true';
  }

  static updateUrl(url: URL, liveEnabled: boolean): URL {
    const next = new URL(url.toString());

    if (liveEnabled) {
      next.searchParams.set(this.liveParam, 'true');
    } else {
      next.searchParams.delete(this.liveParam);
    }

    return next;
  }

  static getState(slot: { startsAt: string; endsAt: string }, referenceTime: Date = new Date()): ProgramLiveState {
    const startsAt = Date.parse(slot.startsAt);
    const endsAt = Date.parse(slot.endsAt);

    if (Number.isNaN(startsAt) || Number.isNaN(endsAt)) {
      return 'upcoming';
    }

    const now = referenceTime.getTime();

    if (now >= endsAt) {
      return 'past';
    }

    if (now >= startsAt) {
      return 'live';
    }

    return 'upcoming';
  }
}
