import { afterEach, describe, expect, it, vi } from 'vitest';

const { schedule } = vi.hoisted(() => ({
  schedule: {
    rooms: [{ id: 'room-1', label: 'Main room', accent: 'from-sky-500 to-cyan-400' }],
    sessions: [
      {
        id: 'talk-1',
        title: 'Morning talk',
        description: 'A talk from the published schedule.',
        startsAt: '2026-12-09T20:30:00Z',
        endsAt: '2026-12-09T21:00:00Z',
        locations: [{ roomId: 'room-1' }],
        speakers: [{ id: 'speaker-1', name: 'Alice Cloud' }],
      },
      {
        id: 'break-1',
        title: 'Morning break',
        description: '',
        startsAt: '2026-12-09T21:00:00Z',
        endsAt: '2026-12-09T21:15:00Z',
        locations: [{ roomId: 'room-1' }],
      },
    ],
  },
}));

vi.mock('astrowind:config', () => ({
  EVENT: {
    startsAt: '2026-12-10T00:30:00+13:00',
    timeZone: 'Pacific/Auckland',
    city: 'Conference city',
    place: 'Conference venue',
    cfp: {
      opensAt: '2026-05-15T00:00:00+02:00',
      closesAt: '2026-09-13T23:59:00+02:00',
      speakersNotifiedAt: '2026-09-01T00:00:00+02:00',
      submissionUrl: 'https://conference-hall.io/kcd-provence-2026',
    },
  },
}));
vi.mock('~/domains/pages/program/content/schedule', () => ({ default: schedule }));

afterEach(() => {
  schedule.rooms.splice(1);
  schedule.sessions.splice(2);
  schedule.sessions[0].startsAt = '2026-12-09T20:30:00Z';
  schedule.sessions[0].endsAt = '2026-12-09T21:00:00Z';
  schedule.sessions[0].speakers = [{ id: 'speaker-1', name: 'Alice Cloud' }];
  vi.resetModules();
});

describe('program page data', () => {
  it('preserves full published timestamps and includes non-talk entries', async () => {
    const { programEnPageData, programFrPageData } = await import('./page-data');

    expect(programEnPageData.sessions).toBe(programFrPageData.sessions);
    expect(programEnPageData.rooms).toEqual(programFrPageData.rooms);
    for (const page of [programEnPageData, programFrPageData]) {
      expect(page.sessions).toEqual(schedule.sessions);
      expect(page).not.toHaveProperty('tracks');
      expect(page.rooms).toEqual(schedule.rooms);
      expect(page.highlights.map((highlight) => highlight.value)).toEqual(['1', '2']);
    }
    expect(programEnPageData.highlights.map((highlight) => highlight.label)).toEqual(['Speakers', 'Sessions']);
    expect(programFrPageData.highlights.map((highlight) => highlight.label)).toEqual(['Intervenants', 'Sessions']);
  });

  it('uses the configured event date and timezone without schedule date metadata', async () => {
    const { programEnPageData, programFrPageData } = await import('./page-data');

    expect(programEnPageData.hero.date).toBe('December 10, 2026');
    expect(programFrPageData.hero.date).toBe('10 décembre 2026');
    expect(programEnPageData.hero.timezone).toBe('Pacific/Auckland');
    expect(programFrPageData.hero.timezone).toBe('Pacific/Auckland');
  });

  it('localizes the single Hallway room without changing its generated identity or source label', async () => {
    const hallway = { id: 'hallway', label: 'Hallway', accent: 'from-amber-500 to-orange-400' };
    schedule.rooms.push(hallway);
    const { programEnPageData, programFrPageData } = await import('./page-data');
    expect(programEnPageData.rooms.find((room) => room.id === hallway.id)).toEqual(hallway);
    expect(programFrPageData.rooms.find((room) => room.id === hallway.id)).toEqual({
      ...hallway,
      label: 'Espace rencontres',
    });
    expect(schedule.rooms[1].label).toBe('Hallway');
  });

  it('counts each published speaker once across repeated appearances', async () => {
    schedule.sessions.push({
      id: 'talk-2',
      title: 'Closing talk',
      description: 'Another session by the same speaker with a guest.',
      startsAt: '2026-12-09T21:30:00Z',
      endsAt: '2026-12-09T22:00:00Z',
      locations: [{ roomId: 'room-1' }],
      speakers: [
        { id: 'speaker-1', name: 'Alice Cloud' },
        { id: 'speaker-2', name: 'Bob Cloud' },
      ],
    });

    const { programEnPageData } = await import('./page-data');

    expect(programEnPageData.highlights).toMatchObject([
      { label: 'Speakers', value: '2' },
      { label: 'Sessions', value: '3' },
    ]);
  });

  it('rejects stale generated sessions on a different day from the configured event', async () => {
    schedule.sessions[0].startsAt = '2026-12-10T20:30:00Z';
    schedule.sessions[0].endsAt = '2026-12-10T21:00:00Z';

    await expect(import('./page-data')).rejects.toThrow(/2026-12-11.*2026-12-10/);
  });
});
