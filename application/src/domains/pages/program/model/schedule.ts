export interface ProgramRoom {
  id: string;
  label: string;
  accent: string;
}

export interface ProgramSpeaker {
  id: string;
  name: string;
  bio?: string;
  company?: string;
  picture?: string;
  socialLinks?: readonly string[];
}

export interface ProgramSession {
  id: string;
  title: string;
  description: string;
  startsAt: string;
  endsAt: string;
  roomId?: string;
  speakers?: readonly ProgramSpeaker[];
  format?: string;
  isGlobal?: boolean;
  tags?: readonly string[];
}

export interface ProgramSessionDefinition extends Omit<ProgramSession, 'startsAt' | 'endsAt'> {
  startsAtTime: string;
  endsAtTime: string;
}

export interface ProgramSlot<Session extends ProgramSession = ProgramSession> {
  key: string;
  startsAt: string;
  endsAt: string;
  sessions: Session[];
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

export const groupProgramSessionsBySlot = <Session extends ProgramSession>(
  sessions: readonly Session[]
): ProgramSlot<Session>[] => {
  const slots = new Map<string, ProgramSlot<Session>>();

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

  return [...slots.values()].sort(
    (left, right) =>
      Date.parse(left.startsAt) - Date.parse(right.startsAt) || Date.parse(left.endsAt) - Date.parse(right.endsAt)
  );
};

/** Group within each room so another room's timings never create empty slots. */
export const groupProgramSessionsByRoom = <Session extends ProgramSession>(
  sessions: readonly Session[]
): Map<string, ProgramSlot<Session>[]> => {
  const rooms = new Map<string, Session[]>();

  for (const session of sessions) {
    const roomId = session.isGlobal ? '' : (session.roomId ?? '');
    const roomSessions = rooms.get(roomId) ?? [];
    roomSessions.push(session);
    rooms.set(roomId, roomSessions);
  }

  return new Map([...rooms].map(([roomId, roomSessions]) => [roomId, groupProgramSessionsBySlot(roomSessions)]));
};
