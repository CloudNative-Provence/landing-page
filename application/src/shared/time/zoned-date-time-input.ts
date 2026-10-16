/** Converts a datetime-local field in an explicit timezone, independent of the browser timezone. */
export class ZonedDateTimeInput {
  private readonly format: Intl.DateTimeFormat;

  constructor(timeZone: string) {
    this.format = new Intl.DateTimeFormat('en-GB', {
      timeZone,
      era: 'short',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    });
  }

  toInput(instant: Date): string {
    const parts = Object.fromEntries(this.format.formatToParts(instant).map(({ type, value }) => [type, value]));
    const year = parts.era === 'BC' ? String(1 - Number(parts.year)) : parts.year;
    return `${year.padStart(4, '0')}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`;
  }

  toInstant(value: string): Date | null {
    if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value) || Number(value.slice(0, 4)) < 1) return null;
    const timestamp = Date.parse(`${value}:00Z`);
    if (!Number.isFinite(timestamp) || new Date(timestamp).toISOString().slice(0, 16) !== value) return null;
    // Sample both sides of a possible DST transition, then verify the local time by round trip.
    const offsets = new Set(
      [-36, 0, 36]
        .map((hours) => {
          const sample = timestamp + hours * 60 * 60 * 1_000;
          return Date.parse(`${this.toInput(new Date(sample))}:00Z`) - sample;
        })
        .filter(Number.isFinite)
    );
    const candidates = [...offsets]
      .map((offset) => new Date(timestamp - offset))
      .filter((instant) => this.toInput(instant) === value)
      .sort((a, b) => a.getTime() - b.getTime());
    // Nonexistent spring-forward times are rejected; repeated autumn times use the first occurrence.
    return candidates[0] ?? null;
  }
}
