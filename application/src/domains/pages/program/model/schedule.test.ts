import { describe, expect, it } from 'vitest';

import { groupProgramSessionsBySlot, ProgramScheduleBuilder } from './schedule';

describe('program utilities', () => {
  it('derives full session datetimes from the event date and local times', () => {
    const sessions = ProgramScheduleBuilder.fromEventDate('2026-12-10T08:15:00+01:00', [
      {
        id: 'opening',
        title: 'Opening',
        description: 'Intro',
        startsAtTime: '09:00',
        endsAtTime: '09:30',
        trackIds: ['main'],
        roomIds: ['auditorium'],
      },
    ]);

    expect(sessions).toEqual([
      {
        id: 'opening',
        title: 'Opening',
        description: 'Intro',
        startsAt: '2026-12-10T09:00:00+01:00',
        endsAt: '2026-12-10T09:30:00+01:00',
        trackIds: ['main'],
        roomIds: ['auditorium'],
      },
    ]);
  });

  it('reuses the event timezone offset for all generated session datetimes', () => {
    const sessions = ProgramScheduleBuilder.fromEventDate('2026-12-10T08:15:00Z', [
      {
        id: 'opening',
        title: 'Opening',
        description: 'Intro',
        startsAtTime: '09:00',
        endsAtTime: '09:30',
        trackIds: ['main'],
        roomIds: ['auditorium'],
      },
    ]);

    expect(sessions[0]?.startsAt).toBe('2026-12-10T09:00:00Z');
    expect(sessions[0]?.endsAt).toBe('2026-12-10T09:30:00Z');
  });

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
