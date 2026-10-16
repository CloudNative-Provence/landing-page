import { describe, expect, it } from 'vitest';

import type { ProgramSession } from '../model/schedule';
import { mergeSharedProgramSessions } from './shared-sessions';

const session: ProgramSession = {
  id: 'left-break',
  locations: [{ roomId: 'left' }],
  title: 'Coffee break',
  description: '',
  startsAt: '2026-12-10T10:40:00+01:00',
  endsAt: '2026-12-10T11:00:00+01:00',
};
const matching = { ...session, id: 'right-break' };

describe('shared program sessions', () => {
  it('keeps the single Hallway location while preserving duplicate source IDs as saved aliases', () => {
    const locations = [{ roomId: 'hallway' }];
    const source = [
      { ...session, locations },
      { ...matching, locations },
    ];
    const original = structuredClone(source);
    const display = mergeSharedProgramSessions(source);
    expect(display).toHaveLength(1);
    expect(display[0]).toMatchObject({
      sourceIds: ['left-break', 'right-break'],
      roomIds: ['hallway'],
      locations,
    });
    expect(display[0]).not.toHaveProperty('roomId');
    expect(display[0]).not.toHaveProperty('isGlobal');
    expect(mergeSharedProgramSessions([...source].reverse())).toEqual(display);
    expect(source).toEqual(original);
  });

  it('preserves main and broadcast roles, even when matching locations are ordered differently', () => {
    const locations = [
      { roomId: 'left', role: 'main' as const },
      { roomId: 'right', role: 'broadcast' as const },
    ];
    const display = mergeSharedProgramSessions([
      { ...session, locations },
      { ...matching, locations: [...locations].reverse() },
    ]);
    expect(display).toHaveLength(1);
    expect(display[0]).toMatchObject({ locations, sourceIds: ['left-break', 'right-break'] });
  });

  it.each<{ locations: ProgramSession['locations'] }>([
    { locations: [{ roomId: 'right' }] },
    { locations: [{ roomId: 'left', role: 'main' }] },
    { locations: [{ roomId: 'left' }, { roomId: 'right' }] },
  ])('does not merge matching content with different locations or roles: %j', ({ locations }) => {
    const display = mergeSharedProgramSessions([session, { ...matching, locations }]);
    expect(display).toHaveLength(2);
    expect(display.every((entry) => entry.sourceIds.length === 1)).toBe(true);
  });

  it('compares timestamp instants so equivalent timezone offsets still merge', () => {
    expect(
      mergeSharedProgramSessions([
        session,
        { ...matching, startsAt: '2026-12-10T09:40:00Z', endsAt: '2026-12-10T10:00:00Z' },
      ])
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
    const display = mergeSharedProgramSessions([session, { ...matching, ...difference }]);
    expect(display).toHaveLength(2);
    expect(display.every((entry) => entry.sourceIds.length === 1)).toBe(true);
  });

  it('keeps identical talks in distinct rooms separate without inferring a broadcast', () => {
    const display = mergeSharedProgramSessions([session, { ...matching, locations: [{ roomId: 'right' }] }]);
    expect(display.map((entry) => entry.locations)).toEqual([[{ roomId: 'left' }], [{ roomId: 'right' }]]);
  });

  it('retains aliases for exact duplicates in a single room', () => {
    const [display] = mergeSharedProgramSessions([session, matching]);
    expect(display).toMatchObject({ locations: [{ roomId: 'left' }], sourceIds: ['left-break', 'right-break'] });
  });

  it('keeps repeated breaks at different times as separate rows', () => {
    const later = { startsAt: '2026-12-10T15:30:00+01:00', endsAt: '2026-12-10T16:00:00+01:00' };
    const display = mergeSharedProgramSessions([
      { ...matching, ...later, id: 'right-later' },
      session,
      { ...session, ...later, id: 'left-later' },
      matching,
    ]);
    expect(display).toHaveLength(2);
    expect(display.map((entry) => entry.startsAt)).toEqual([session.startsAt, later.startsAt]);
  });

  it('does not invent destinations for unassigned sessions and tolerates an empty schedule', () => {
    const [display] = mergeSharedProgramSessions([{ ...session, locations: [] }]);
    expect(display).toMatchObject({ locations: [], roomIds: [], sourceIds: ['left-break'] });
    expect(mergeSharedProgramSessions([])).toEqual([]);
  });
});
