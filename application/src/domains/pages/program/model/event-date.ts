interface ScheduleDates {
  days?: readonly string[];
  sessions: readonly {
    id: string;
    startsAt: string;
    endsAt: string;
  }[];
}

interface EventDateConfig {
  startsAt: string;
  timeZone: string;
}

/**
 * Ensure imported or checked-in sessions belong to the configured event day.
 * The event opening time does not constrain individual session start times.
 */
export function assertScheduleMatchesEvent(schedule: ScheduleDates, event: EventDateConfig): void {
  if (typeof event.timeZone !== 'string' || !event.timeZone.trim()) {
    throw new Error('Invalid event.timeZone in config.yaml.');
  }

  let formatter: Intl.DateTimeFormat;
  try {
    formatter = new Intl.DateTimeFormat('en', {
      timeZone: event.timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  } catch {
    throw new Error(`Invalid event.timeZone in config.yaml: "${event.timeZone}".`);
  }

  const localDate = (value: string, field: string): string => {
    if (
      typeof value !== 'string' ||
      !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?(?:Z|[+-]\d{2}:\d{2})$/.test(value) ||
      !Number.isFinite(Date.parse(value)) ||
      new Date(`${value.slice(0, 10)}T00:00:00Z`).toISOString().slice(0, 10) !== value.slice(0, 10) ||
      Number(value.slice(11, 13)) > 23
    ) {
      throw new Error(`Invalid ${field}: expected an ISO timestamp with a timezone offset.`);
    }
    const parts = Object.fromEntries(formatter.formatToParts(new Date(value)).map(({ type, value }) => [type, value]));
    return `${parts.year}-${parts.month}-${parts.day}`;
  };

  const eventDate = localDate(event.startsAt, 'event.startsAt in config.yaml');
  const requireEventDate = (value: string, field: string): void => {
    const actualDate = localDate(value, field);
    if (actualDate !== eventDate) {
      throw new Error(
        `Schedule date mismatch: ${field} is ${actualDate}; event.startsAt in config.yaml requires ${eventDate} (${event.timeZone}).`
      );
    }
  };

  for (const [index, day] of (schedule.days ?? []).entries()) {
    requireEventDate(day, `schedule.days[${index}]`);
  }
  for (const session of schedule.sessions) {
    requireEventDate(session.startsAt, `session "${session.id}" start`);
    requireEventDate(session.endsAt, `session "${session.id}" end`);
  }
}
