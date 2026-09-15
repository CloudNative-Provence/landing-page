import type { ProgramRoom, ProgramSession } from '../model/schedule';

export interface ProgramDisplaySession extends ProgramSession {
  sourceIds: readonly string[];
  roomIds: readonly string[];
}

function contentKey(session: ProgramSession): string {
  return JSON.stringify([
    Date.parse(session.startsAt),
    Date.parse(session.endsAt),
    session.title,
    session.description,
    session.format ?? '',
    session.tags ?? [],
    (session.speakers ?? []).map((speaker) => [
      speaker.id,
      speaker.name,
      speaker.bio ?? '',
      speaker.company ?? '',
      speaker.picture ?? '',
      speaker.socialLinks ?? [],
    ]),
  ]);
}

/** Merge only an exact match with one published entry in every configured room. */
export function mergeSharedProgramSessions(
  sessions: readonly ProgramSession[],
  rooms: readonly ProgramRoom[]
): ProgramDisplaySession[] {
  const roomIds = rooms.map((room) => room.id);
  const groups = new Map<string, ProgramSession[]>();
  const result: ProgramDisplaySession[] = [];

  for (const session of sessions) {
    if (session.isGlobal || !session.roomId) {
      result.push({ ...session, isGlobal: true, roomId: undefined, sourceIds: [session.id], roomIds });
      continue;
    }
    const key = contentKey(session);
    const group = groups.get(key) ?? [];
    group.push(session);
    groups.set(key, group);
  }

  for (const group of groups.values()) {
    const coversEveryRoom =
      roomIds.length > 1 &&
      group.length === roomIds.length &&
      roomIds.every((id) => group.some((session) => session.roomId === id));
    if (coversEveryRoom) {
      const ordered = [...group].sort((left, right) => left.id.localeCompare(right.id));
      result.push({
        ...ordered[0],
        roomId: undefined,
        isGlobal: true,
        sourceIds: ordered.map((session) => session.id),
        roomIds,
      });
    } else {
      result.push(...group.map((session) => ({ ...session, sourceIds: [session.id], roomIds: [session.roomId!] })));
    }
  }

  return result.sort(
    (left, right) =>
      Date.parse(left.startsAt) - Date.parse(right.startsAt) ||
      Date.parse(left.endsAt) - Date.parse(right.endsAt) ||
      (left.roomId ?? '').localeCompare(right.roomId ?? '') ||
      left.id.localeCompare(right.id)
  );
}
