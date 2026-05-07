import { describe, expect, it } from 'vitest';

import { groupProgramSessionsBySlot } from './program';

describe('program utilities', () => {
  it('groups sessions sharing the same time slot', () => {
    const slots = groupProgramSessionsBySlot([
      {
        id: 'a',
        title: 'Opening',
        description: 'Intro',
        startsAt: '2026-12-10T09:00:00+01:00',
        endsAt: '2026-12-10T09:30:00+01:00',
        trackIds: ['main'],
        roomIds: ['auditorium'],
      },
      {
        id: 'b',
        title: 'Deep Dive',
        description: 'Talk',
        startsAt: '2026-12-10T09:00:00+01:00',
        endsAt: '2026-12-10T09:30:00+01:00',
        trackIds: ['platform'],
        roomIds: ['cedar'],
      },
      {
        id: 'c',
        title: 'Break',
        description: 'Coffee',
        startsAt: '2026-12-10T09:30:00+01:00',
        endsAt: '2026-12-10T10:00:00+01:00',
        trackIds: ['main', 'platform'],
        roomIds: ['expo'],
        isGlobal: true,
      },
    ]);

    expect(slots).toHaveLength(2);
    expect(slots[0].sessions.map((session) => session.id)).toEqual(['a', 'b']);
    expect(slots[1].sessions[0].id).toBe('c');
  });
});
