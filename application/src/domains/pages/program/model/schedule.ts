export interface ProgramTrack {
  id: string;
  label: string;
  accent: string;
}

export interface ProgramRoom {
  id: string;
  label: string;
}

export interface ProgramSession {
  id: string;
  title: string;
  description: string;
  startsAt: string;
  endsAt: string;
  trackIds: readonly string[];
  roomIds: readonly string[];
  speakers?: readonly string[];
  format?: string;
  isGlobal?: boolean;
  tags?: readonly string[];
}

export interface ProgramSessionDefinition extends Omit<ProgramSession, 'startsAt' | 'endsAt'> {
  startsAtTime: string;
  endsAtTime: string;
}

export interface ProgramSlot {
  key: string;
  startsAt: string;
  endsAt: string;
  sessions: ProgramSession[];
}

export class ProgramScheduleBuilder {
  static fromEventDate(eventStartsAt: string, sessions: readonly ProgramSessionDefinition[]): ProgramSession[] {
    const { datePart, offsetPart } = this.parseEventDate(eventStartsAt);

    return sessions.map((session) => {
      const { startsAtTime, endsAtTime, ...baseSession } = session;

      return {
        ...baseSession,
        startsAt: this.composeDateTime(datePart, startsAtTime, offsetPart),
        endsAt: this.composeDateTime(datePart, endsAtTime, offsetPart),
      };
    });
  }

  private static parseEventDate(eventStartsAt: string): { datePart: string; offsetPart: string } {
    const match = eventStartsAt.match(/^(\d{4}-\d{2}-\d{2})T\d{2}:\d{2}:\d{2}(Z|[+-]\d{2}:\d{2})$/);
    if (!match) {
      throw new Error(`Invalid event start date: ${eventStartsAt}`);
    }

    return {
      datePart: match[1],
      offsetPart: match[2],
    };
  }

  private static composeDateTime(datePart: string, localTime: string, offsetPart: string): string {
    if (!/^\d{2}:\d{2}$/.test(localTime)) {
      throw new Error(`Invalid local session time: ${localTime}`);
    }

    return `${datePart}T${localTime}:00${offsetPart}`;
  }
}

export const groupProgramSessionsBySlot = (sessions: readonly ProgramSession[]): ProgramSlot[] => {
  const slots = new Map<string, ProgramSlot>();

  sessions.forEach((session) => {
    const key = `${session.startsAt}-${session.endsAt}`;
    const current = slots.get(key);

    if (current) {
      current.sessions.push(session);
      return;
    }

    slots.set(key, {
      key,
      startsAt: session.startsAt,
      endsAt: session.endsAt,
      sessions: [session],
    });
  });

  return [...slots.values()].sort((left, right) => left.startsAt.localeCompare(right.startsAt));
};
