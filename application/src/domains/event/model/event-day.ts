import { AppClock } from '~/shared/time/app-clock';

/** The event's calendar day in its configured timezone, independent of the visitor's timezone. */
export class EventDay {
  private readonly formatter: Intl.DateTimeFormat;
  private readonly date: string;

  constructor(startsAt: string, timeZone: string) {
    this.formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    this.date = this.formatter.format(new Date(startsAt));
  }

  includes(now: Date = AppClock.now()): boolean {
    return Number.isFinite(now.getTime()) && this.formatter.format(now) === this.date;
  }
}
