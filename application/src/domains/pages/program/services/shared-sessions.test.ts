import { describe, expect, it } from 'vitest';

import type { ProgramSession } from '../model/schedule';
import { mergeSharedProgramSessions } from './shared-sessions';

const rooms = [
  { id: 'left', label: 'Left room', accent: 'blue' },
  { id: 'right', label: 'Right room', accent: 'green' },
];
const session: ProgramSession = {
  id: 'left-break',
  roomId: 'left',
  title: 'Coffee break',
  description: '',
  startsAt: '2026-12-10T10:40:00+01:00',
  endsAt: '2026-12-10T11:00:00+01:00',
};
const matching = { ...session, id: 'right-break', roomId: 'right' };

describe('shared program sessions', () => {
  it('renders one entry when the same session runs in every room', () => {
    const source = [session, matching];
    const original = structuredClone(source);
    const display = mergeSharedProgramSessions(source, rooms);
    expect(display).toEqual([
      {
        ...session,
        roomId: undefined,
        isGlobal: true,
        sourceIds: ['left-break', 'right-break'],
        roomIds: ['left', 'right'],
      },
    ]);
    expect(source).toEqual(original);
    expect(mergeSharedProgramSessions([...source].reverse(), rooms)).toEqual(display);
  });

  it('compares timestamp instants so equivalent timezone offsets still merge', () => {
    expect(
      mergeSharedProgramSessions(
        [session, { ...matching, startsAt: '2026-12-10T09:40:00Z', endsAt: '2026-12-10T10:00:00Z' }],
        rooms
      )
    ).toHaveLength(1);
  });

  it.each<Partial<ProgramSession>>([
    { title: 'Another session' },
    { description: 'Different description' },
    { startsAt: '2026-12-10T10:45:00+01:00' },
    { endsAt: '2026-12-10T11:15:00+01:00' },
    { speakers: [{ id: 'speaker', name: 'Another speaker' }] },
    { format: 'Talk' },
    { tags: ['Cloud'] },
  ])('keeps sessions separate when their content or timing differs: %j', (difference) => {
    const display = mergeSharedProgramSessions([session, { ...matching, ...difference }], rooms);
    expect(display).toHaveLength(2);
    expect(display.every((entry) => !entry.isGlobal && entry.sourceIds.length === 1)).toBe(true);
  });

  it('requires every configured room, even when a subset has matching sessions', () => {
    const threeRooms = [...rooms, { id: 'third', label: 'Third room', accent: 'pink' }];
    expect(mergeSharedProgramSessions([session, matching], threeRooms)).toHaveLength(2);
    expect(
      mergeSharedProgramSessions([session, matching, { ...session, id: 'third-break', roomId: 'third' }], threeRooms)
    ).toHaveLength(1);
  });

  it('does not mistake duplicate entries in one room for coverage of every room', () => {
    expect(mergeSharedProgramSessions([session, { ...session, id: 'duplicate' }], rooms)).toHaveLength(2);
    expect(mergeSharedProgramSessions([session, matching, { ...session, id: 'duplicate' }], rooms)).toHaveLength(3);
  });

  it('keeps a single-room session assigned to its room', () => {
    const [display] = mergeSharedProgramSessions([session], [rooms[0]]);
    expect(display.roomId).toBe('left');
    expect(display.isGlobal).not.toBe(true);
  });

  it('keeps repeated breaks at different times as separate shared rows', () => {
    const later = { startsAt: '2026-12-10T15:30:00+01:00', endsAt: '2026-12-10T16:00:00+01:00' };
    const display = mergeSharedProgramSessions(
      [{ ...matching, ...later, id: 'right-later' }, session, { ...session, ...later, id: 'left-later' }, matching],
      rooms
    );
    expect(display).toHaveLength(2);
    expect(display.map((entry) => entry.startsAt)).toEqual([session.startsAt, later.startsAt]);
  });

  it('preserves explicit global entries and tolerates an empty schedule', () => {
    const [display] = mergeSharedProgramSessions([{ ...session, isGlobal: true }], rooms);
    expect(display).toMatchObject({
      isGlobal: true,
      roomId: undefined,
      sourceIds: ['left-break'],
      roomIds: ['left', 'right'],
    });
    expect(mergeSharedProgramSessions([], rooms)).toEqual([]);
  });
});
