import type { ProgramSession } from '../model/schedule';
import { ProgramSessionGroups } from '../model/session-groups';

export interface ProgramDisplaySession extends ProgramSession {
  sourceIds: readonly string[];
  roomIds: readonly string[];
}

/** Merge identical sessions only when their generated destinations and roles match. */
export function mergeSharedProgramSessions(sessions: readonly ProgramSession[]): ProgramDisplaySession[] {
  const result: ProgramDisplaySession[] = [];
  for (const group of ProgramSessionGroups.byContent(sessions)) {
    const destinations = new Map<string, ProgramSession[]>();
    for (const session of group) {
      const key = JSON.stringify(
        session.locations
          .map(({ roomId, role }) => [roomId, role ?? ''])
          .sort(([left], [right]) => left.localeCompare(right))
      );
      const matching = destinations.get(key) ?? [];
      matching.push(session);
      destinations.set(key, matching);
    }
    for (const matching of destinations.values()) {
      const ordered = [...matching].sort((left, right) => left.id.localeCompare(right.id));
      result.push({
        ...ordered[0],
        sourceIds: ordered.map((session) => session.id),
        roomIds: ordered[0].locations.map((location) => location.roomId),
      });
    }
  }
  return result.sort(
    (left, right) =>
      Date.parse(left.startsAt) - Date.parse(right.startsAt) ||
      Date.parse(left.endsAt) - Date.parse(right.endsAt) ||
      (left.roomIds[0] ?? '').localeCompare(right.roomIds[0] ?? '') ||
      left.id.localeCompare(right.id)
  );
}
