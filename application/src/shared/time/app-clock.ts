/** Shared wall clock for attendee-facing time-dependent behaviour. */
export class AppClock {
  static readonly changeEvent = 'cnp:clock-change';
  private static developmentOffset = 0;

  static timestamp(): number {
    return Date.now() + (import.meta.env.DEV ? this.developmentOffset : 0);
  }

  static now(): Date {
    return new Date(this.timestamp());
  }

  static setDevelopmentOffset(offset: number): void {
    if (!import.meta.env.DEV || typeof window === 'undefined') return;
    if (!Number.isFinite(offset) || !Number.isFinite(new Date(Date.now() + offset).getTime())) {
      throw new RangeError('Invalid development clock offset.');
    }
    this.developmentOffset = offset;
    window.dispatchEvent(new Event(this.changeEvent));
  }
}
