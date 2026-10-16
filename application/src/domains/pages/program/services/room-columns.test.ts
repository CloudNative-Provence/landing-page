import { describe, expect, it } from 'vitest';
import schedule from '../content/schedule';
import type { ProgramSession } from '../model/schedule';
import { ProgramRoomColumns } from './room-columns';
import { mergeSharedProgramSessions } from './shared-sessions';

describe('programme room columns', () => {
  const sessions = mergeSharedProgramSessions(schedule.sessions);
  const layout = ProgramRoomColumns.build(schedule.rooms, sessions);

  it('places the single Hallway room first, followed by the conference columns', () => {
    expect(layout.columns.map((column) => column.roomIds)).toEqual([['hallway'], ['amphitheatre'], ['salle-milhaud']]);
    const keynote = layout.slots.find(({ slot }) => slot.sessions.some((session) => session.format === 'keynote'))!;
    expect(keynote.columnIds).toEqual(['amphitheatre', 'salle-milhaud']);
  });

  it('preserves overlapping hallway activity times and saved IDs within one cell', () => {
    const lunch: ProgramSession = {
      id: 'lunch',
      title: 'Lunch',
      description: '',
      startsAt: '2026-12-10T12:00:00+01:00',
      endsAt: '2026-12-10T13:00:00+01:00',
      locations: [{ roomId: 'hallway' }],
    };
    const networking = { ...lunch, id: 'networking', title: 'Networking', endsAt: '2026-12-10T13:30:00+01:00' };
    const grouped = ProgramRoomColumns.build(
      [{ id: 'hallway', label: 'Hallway', accent: 'orange', kind: 'hallway' }],
      mergeSharedProgramSessions([lunch, networking])
    );
    expect(grouped.slots).toHaveLength(1);
    expect(grouped.slots[0]).toMatchObject({
      columnIds: ['hallway'],
      slot: {
        startsAt: lunch.startsAt,
        endsAt: networking.endsAt,
        sessions: [
          { id: 'lunch', endsAt: lunch.endsAt },
          { id: 'networking', endsAt: networking.endsAt },
        ],
      },
    });
  });

  it('displays every published session without overlapping cells in the same columns', () => {
    for (const left of layout.slots) {
      for (const right of layout.slots) {
        if (left === right || !left.columnIds.some((id) => right.columnIds.includes(id))) continue;
        expect(
          Date.parse(left.slot.startsAt) < Date.parse(right.slot.endsAt) &&
            Date.parse(right.slot.startsAt) < Date.parse(left.slot.endsAt)
        ).toBe(false);
      }
    }
    expect(layout.slots.flatMap(({ slot }) => slot.sessions.map((session) => session.id)).sort()).toEqual(
      sessions.map((session) => session.id).sort()
    );
  });
});
