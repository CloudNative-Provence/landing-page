import type { ProgramRoom, ProgramSlot } from '../model/schedule';
import type { ProgramDisplaySession } from './shared-sessions';

export interface ProgramRoomColumn extends ProgramRoom {
  roomIds: readonly string[];
}

/** Hallway comes first; every published room has its own column. */
export class ProgramRoomColumns {
  static build(rooms: readonly ProgramRoom[], sessions: readonly ProgramDisplaySession[]) {
    const active = rooms.filter((room) => sessions.some((session) => session.roomIds.includes(room.id)));
    const columns: ProgramRoomColumn[] = [
      ...active.filter((room) => room.kind === 'hallway'),
      ...active.filter((room) => room.kind !== 'hallway'),
    ].map((room) => ({ ...room, roomIds: [room.id] }));

    const groups = new Map<string, { columnIds: string[]; slots: ProgramSlot<ProgramDisplaySession>[] }>();
    for (const session of [...sessions].sort((a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt))) {
      const columnIds = columns
        .filter((column) => column.roomIds.some((id) => session.roomIds.includes(id)))
        .map((column) => column.id);
      const key = JSON.stringify(columnIds);
      const group = groups.get(key) ?? { columnIds, slots: [] };
      const previous = group.slots.at(-1);
      // Keep overlapping source durations in one cell, with each card's own times.
      if (previous && Date.parse(session.startsAt) < Date.parse(previous.endsAt)) {
        previous.sessions.push(session);
        if (Date.parse(session.endsAt) > Date.parse(previous.endsAt)) previous.endsAt = session.endsAt;
      } else {
        group.slots.push({ key: session.id, startsAt: session.startsAt, endsAt: session.endsAt, sessions: [session] });
      }
      groups.set(key, group);
    }
    const slots = [...groups.values()]
      .flatMap(({ columnIds, slots }) => slots.map((slot) => ({ columnIds, slot })))
      .sort((a, b) => Date.parse(a.slot.startsAt) - Date.parse(b.slot.startsAt));
    return { columns, slots };
  }
}
