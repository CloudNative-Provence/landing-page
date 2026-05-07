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

export interface ProgramSlot {
  key: string;
  startsAt: string;
  endsAt: string;
  sessions: ProgramSession[];
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
