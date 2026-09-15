import { describe, expect, it } from 'vitest';

import { groupProgramSessionsByRoom, groupProgramSessionsBySlot, ProgramScheduleBuilder } from './schedule';

describe('program utilities', () => {
  it('derives full session datetimes from the event date and local times', () => {
    const sessions = ProgramScheduleBuilder.fromEventDate('2026-12-10T08:15:00+01:00', [
      {
        id: 'opening',
        title: 'Opening',
        description: 'Intro',
        startsAtTime: '09:00',
        endsAtTime: '09:30',
        roomId: 'main',
      },
    ]);

    expect(sessions).toEqual([
      {
        id: 'opening',
        title: 'Opening',
        description: 'Intro',
        startsAt: '2026-12-10T09:00:00+01:00',
        endsAt: '2026-12-10T09:30:00+01:00',
        roomId: 'main',
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
        roomId: 'main',
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
        roomId: 'main',
      },
      {
        id: 'b',
        title: 'Deep Dive',
        description: 'Talk',
        startsAt: '2026-12-10T09:00:00+01:00',
        endsAt: '2026-12-10T09:30:00+01:00',
        roomId: 'platform',
      },
      {
        id: 'c',
        title: 'Break',
        description: 'Coffee',
        startsAt: '2026-12-10T09:30:00+01:00',
        endsAt: '2026-12-10T10:00:00+01:00',
        isGlobal: true,
      },
    ]);

    expect(slots).toHaveLength(2);
    expect(slots[0].sessions.map((session) => session.id)).toEqual(['a', 'b']);
    expect(slots[1].sessions[0].id).toBe('c');
  });

  it('keeps a long session in one room independent from shorter sessions in another', () => {
    const sessions = [
      {
        id: 'left-long',
        title: 'Long talk',
        description: 'Room stays busy',
        startsAt: '2026-12-10T11:45:00+01:00',
        endsAt: '2026-12-10T12:15:00+01:00',
        roomId: 'left-room',
      },
      {
        id: 'right-short-one',
        title: 'Short talk 1',
        description: 'Other room',
        startsAt: '2026-12-10T11:50:00+01:00',
        endsAt: '2026-12-10T12:00:00+01:00',
        roomId: 'right-room',
      },
      {
        id: 'right-short-two',
        title: 'Short talk 2',
        description: 'Other room',
        startsAt: '2026-12-10T12:05:00+01:00',
        endsAt: '2026-12-10T12:15:00+01:00',
        roomId: 'right-room',
      },
    ];

    const rooms = groupProgramSessionsByRoom(sessions);
    const leftSlots = rooms.get('left-room')!;
    const rightSlots = rooms.get('right-room')!;

    expect(leftSlots).toHaveLength(1);
    expect(leftSlots[0]).toMatchObject({
      startsAt: '2026-12-10T11:45:00+01:00',
      endsAt: '2026-12-10T12:15:00+01:00',
      sessions: [sessions[0]],
    });
    expect(rightSlots.map((slot) => slot.sessions[0].id)).toEqual(['right-short-one', 'right-short-two']);
    expect(rightSlots.map((slot) => slot.startsAt)).toEqual(['2026-12-10T11:50:00+01:00', '2026-12-10T12:05:00+01:00']);
    expect([...rooms.values()].flat().every((slot) => slot.sessions.length > 0)).toBe(true);
  });

  it('sorts each room chronologically by instant without changing the source sessions', () => {
    const session = { title: 'Talk', description: '', roomId: 'main' };
    const sessions = [
      { ...session, id: 'later', startsAt: '2026-12-10T09:00:00Z', endsAt: '2026-12-10T09:30:00Z' },
      { ...session, id: 'earlier', startsAt: '2026-12-10T10:30:00+02:00', endsAt: '2026-12-10T10:45:00+02:00' },
    ];
    const original = structuredClone(sessions);

    expect(
      groupProgramSessionsByRoom(sessions)
        .get('main')
        ?.map((slot) => slot.sessions[0].id)
    ).toEqual(['earlier', 'later']);
    expect(sessions).toEqual(original);
  });

  it('preserves global sessions once without duplicating them into room timelines', () => {
    const session = {
      title: 'Opening',
      description: '',
      startsAt: '2026-12-10T09:00:00+01:00',
      endsAt: '2026-12-10T09:30:00+01:00',
    };
    const rooms = groupProgramSessionsByRoom([
      { ...session, id: 'unassigned' },
      { ...session, id: 'global', roomId: 'main', isGlobal: true },
      { ...session, id: 'room-talk', roomId: 'main' },
    ]);

    expect(rooms.get('')?.flatMap((slot) => slot.sessions.map((entry) => entry.id))).toEqual(['unassigned', 'global']);
    expect(rooms.get('main')?.flatMap((slot) => slot.sessions.map((entry) => entry.id))).toEqual(['room-talk']);
    expect(groupProgramSessionsByRoom([]).size).toBe(0);
  });
});
